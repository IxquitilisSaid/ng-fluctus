const AudioContext = window['AudioContext'] || window['webkitAudioContext'];

class SburdoModulo {
    ctx: any;
    analyser: any;
    stereo: boolean;
    audible: boolean;
    wavedata: any;
    freqdata: any;
    splitter: any;
    merger: any;
    source: any;
    output: any;

    constructor(audio: HTMLAudioElement | AudioNode | MediaStream, ctx?: AudioContext | any, opts?: {stereo?: any; audible?: any; }) {
        if (!(this instanceof SburdoModulo)) {
            return new SburdoModulo(audio, ctx, opts);
        }

        if (!(ctx instanceof AudioContext)) {
            (opts = ctx), (ctx = null);
        }

        opts = opts || {};
        this.ctx = ctx = ctx || new AudioContext();

        if (!(audio instanceof AudioNode)) {
            audio =
                audio instanceof Audio || audio instanceof HTMLAudioElement
                    ? ctx.createMediaElementSource(audio)
                    : ctx.createMediaStreamSource(audio);
        }

        this.analyser = ctx.createAnalyser();
        this.stereo = !!opts.stereo;
        this.audible = opts.audible !== false;
        this.wavedata = null;
        this.freqdata = null;
        this.splitter = null;
        this.merger = null;
        this.source = audio;

        if (!this.stereo) {
            this.output = this.source;
            this.source.connect(this.analyser);

            if (this.audible) {
                this.analyser.connect(ctx.destination);
            }
        } else {
            this.analyser = [this.analyser];
            this.analyser.push(ctx.createAnalyser());
            this.splitter = ctx.createChannelSplitter(2);
            this.merger = ctx.createChannelMerger(2);
            this.output = this.merger;
            this.source.connect(this.splitter);

            for (let i = 0; i < 2; i++) {
                this.splitter.connect(this.analyser[i], i, 0);
                this.analyser[i].connect(this.merger, 0, i);
            }

            if (this.audible) {
                this.merger.connect(ctx.destination);
            }
        }
    }

    waveform(output: any, channel: any) {
        if (!output) {
            output =
                this.wavedata ||
                (this.wavedata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount));
        }

        const analyser = this.stereo ? this.analyser[channel || 0] : this.analyser;

        analyser.getByteTimeDomainData(output);

        return output;
    }

    frequencies({output, channel}: {output: any; channel: any; }) {
        if (!output) {
            output =
                this.freqdata ||
                (this.freqdata = new Uint8Array((this.analyser[0] || this.analyser).frequencyBinCount));
        }

        const analyser = this.stereo ? this.analyser[channel || 0] : this.analyser;
        analyser.getByteFrequencyData(output);
        return output;
    }
}

export default SburdoModulo;
