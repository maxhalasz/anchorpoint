/* Vendored from @soundtouchjs/formant-correction-worklet v2.1.1 (MPL-2.0).
   https://github.com/cutterbl/SoundTouchJS — bundled with esbuild for offline use. */
var SoundTouchFormant = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@soundtouchjs/formant-correction-worklet/.dist/index.js
  var index_exports = {};
  __export(index_exports, {
    FormantCorrectionNode: () => FormantCorrectionNode,
    LPC_ORDER: () => LPC_ORDER,
    LPC_WINDOW: () => LPC_WINDOW,
    PROCESSOR_NAME: () => PROCESSOR_NAME,
    applyAnalysisFilter: () => applyAnalysisFilter,
    applySynthesisFilter: () => applySynthesisFilter,
    autocorrelate: () => autocorrelate,
    levinsonDurbin: () => levinsonDurbin,
    processOffline: () => processOffline
  });

  // node_modules/@soundtouchjs/formant-correction-worklet/.dist/constants.js
  var PROCESSOR_NAME = "formant-correction-processor";
  var DEFAULT_SAMPLE_BUFFER_TYPE = "circular";
  var LPC_ORDER = 16;
  var LPC_WINDOW = 512;

  // node_modules/@soundtouchjs/formant-correction-worklet/.dist/FormantCorrectionNode.js
  var FormantCorrectionNode = class extends AudioWorkletNode {
    /**
     * The registered processor name for this node type.
     */
    static processorName = PROCESSOR_NAME;
    /**
     * Registers the formant correction processor module with the given AudioContext.
     *
     * @param context - The AudioContext or OfflineAudioContext.
     * @param processorUrl - URL or path to the processor bundle.
     */
    static async register(context, processorUrl) {
      await context.audioWorklet.addModule(processorUrl);
    }
    /**
     * Registers an interpolation strategy installer module in AudioWorkletGlobalScope.
     *
     * @remarks
     * The module should call core registration APIs during evaluation.
     */
    static async registerStrategyModule(context, strategyModuleUrl) {
      await context.audioWorklet.addModule(strategyModuleUrl);
    }
    _lastMetrics = null;
    /**
     * Creates a `FormantCorrectionNode` instance.
     * @param options - Node and processor configuration.
     */
    constructor({ context, sampleBufferType, interpolationStrategy, outputChannelCount }) {
      super(context, PROCESSOR_NAME, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [outputChannelCount ?? 2],
        processorOptions: {
          sampleBufferType: sampleBufferType ?? DEFAULT_SAMPLE_BUFFER_TYPE,
          interpolationStrategy
        }
      });
      this.port.onmessage = (event) => {
        const message = event.data;
        if (message?.type === "metrics") {
          const metrics = {
            framesBuffered: message.framesBuffered,
            underrunCount: message.underrunCount,
            blockCount: message.blockCount,
            timestamp: performance.now()
          };
          this._lastMetrics = metrics;
          this.dispatchEvent(new CustomEvent("metrics", { detail: metrics }));
        }
      };
    }
    /**
     * Returns the most recent processor metrics, or `null` before the first report.
     *
     * @remarks
     * Updated every 100 render blocks. Also dispatched as a `metrics` CustomEvent.
     */
    get metrics() {
      return this._lastMetrics;
    }
    /**
     * Pitch multiplier AudioParam (1.0 = original pitch).
     */
    get pitch() {
      return this.parameters.get("pitch");
    }
    /**
     * Semitone pitch shift AudioParam (integer steps for musical key changes).
     */
    get pitchSemitones() {
      return this.parameters.get("pitchSemitones");
    }
    /**
     * Playback rate AudioParam. Set to match the source node's `playbackRate`
     * for accurate pitch compensation.
     */
    get playbackRate() {
      return this.parameters.get("playbackRate");
    }
    /**
     * Formant correction strength AudioParam (0.0–1.0, k-rate).
     *
     * @remarks
     * - `0.0` — no correction; output is identical to `SoundTouchNode`.
     * - `1.0` — full correction; original vocal formants are preserved at the new pitch.
     * - Intermediate values linearly blend the corrected and uncorrected signals.
     */
    get formantStrength() {
      return this.parameters.get("formantStrength");
    }
    /**
     * Switches interpolation strategy at runtime in the render-thread processor.
     * @param strategy The new interpolation strategy to use.
     */
    setInterpolationStrategy(strategy) {
      this.port.postMessage({
        type: "set-interpolation-strategy",
        strategy
      });
    }
    /**
     * Applies a partial params update to the active interpolation strategy.
     * @param params Partial set of parameters to update.
     */
    setInterpolationStrategyParams(params) {
      this.port.postMessage({
        type: "set-interpolation-strategy-params",
        params
      });
    }
    /**
     * Applies WSOLA timing parameter updates to the render-thread processor.
     * @param params WSOLA timing parameters.
     */
    setStretchParameters(params) {
      this.port.postMessage({
        type: "set-stretch-parameters",
        params
      });
    }
  };

  // node_modules/@soundtouchjs/formant-correction-worklet/.dist/processOffline.js
  async function processOffline(options) {
    const { input, processorUrl, pitch = 1, pitchSemitones = 0, playbackRate = 1, formantStrength = 1, interpolationStrategy, stretchParameters, sampleBufferType } = options;
    const outputLength = Math.ceil(input.length / playbackRate);
    const offlineCtx = new OfflineAudioContext(input.numberOfChannels, outputLength, input.sampleRate);
    await FormantCorrectionNode.register(offlineCtx, processorUrl);
    const node = new FormantCorrectionNode({
      context: offlineCtx,
      interpolationStrategy,
      sampleBufferType
    });
    node.pitch.value = pitch;
    node.pitchSemitones.value = pitchSemitones;
    node.playbackRate.value = playbackRate;
    node.formantStrength.value = formantStrength;
    if (stretchParameters) {
      node.setStretchParameters(stretchParameters);
    }
    node.connect(offlineCtx.destination);
    const source = offlineCtx.createBufferSource();
    source.buffer = input;
    source.playbackRate.value = playbackRate;
    source.connect(node);
    source.start(0);
    return offlineCtx.startRendering();
  }

  // node_modules/@soundtouchjs/formant-correction-worklet/.dist/lpc.js
  function autocorrelate(frame, order) {
    const N = frame.length;
    const windowed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      windowed[i] = frame[i] * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1)));
    }
    const r = new Float32Array(order + 1);
    for (let k = 0; k <= order; k++) {
      let sum = 0;
      for (let n = 0; n < N - k; n++) {
        sum += windowed[n] * windowed[n + k];
      }
      r[k] = sum;
    }
    return r;
  }
  function levinsonDurbin(r, order) {
    const a = new Float32Array(order);
    if (r[0] < 1e-10)
      return a;
    const aPrev = new Float32Array(order);
    let E = r[0];
    for (let m = 1; m <= order; m++) {
      let num = r[m];
      for (let j = 0; j < m - 1; j++) {
        num -= a[j] * r[m - 1 - j];
      }
      if (Math.abs(E) < 1e-15)
        break;
      const k = Math.max(-0.9999, Math.min(0.9999, num / E));
      for (let j = 0; j < m - 1; j++)
        aPrev[j] = a[j];
      for (let j = 0; j < m - 1; j++) {
        a[j] = aPrev[j] - k * aPrev[m - 2 - j];
      }
      a[m - 1] = k;
      E *= 1 - k * k;
      if (E < 1e-15)
        break;
    }
    return a;
  }
  function applyAnalysisFilter(frame, a, zi) {
    const order = a.length;
    const out = new Float32Array(frame.length);
    for (let n = 0; n < frame.length; n++) {
      let e = frame[n];
      for (let k = 0; k < order; k++) {
        e -= a[k] * zi[k];
      }
      out[n] = e;
      for (let k = order - 1; k > 0; k--) {
        zi[k] = zi[k - 1];
      }
      zi[0] = frame[n];
    }
    return out;
  }
  function applySynthesisFilter(frame, a, zi) {
    const order = a.length;
    const out = new Float32Array(frame.length);
    for (let n = 0; n < frame.length; n++) {
      let y = frame[n];
      for (let k = 0; k < order; k++) {
        y += a[k] * zi[k];
      }
      if (!Number.isFinite(y)) {
        zi.fill(0);
        y = 0;
      }
      out[n] = y;
      for (let k = order - 1; k > 0; k--) {
        zi[k] = zi[k - 1];
      }
      zi[0] = y;
    }
    return out;
  }
  return __toCommonJS(index_exports);
})();
