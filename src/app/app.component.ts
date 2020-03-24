import {Component, ViewChild, ElementRef} from '@angular/core';
import NgModulo from 'ng-modulo';

@Component({
    selector: 'fl-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    private _audioAnalyser: NgModulo;
    private _ctx: CanvasRenderingContext2D;

    public isWaveShown = false;
    public controlsEnabled = true;

    @ViewChild('audioSource', {static: false}) audioSource: ElementRef<HTMLAudioElement>;
    @ViewChild('waveCanvas', {static: false}) waveCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('uploadSection', {static: false}) uploadSection: ElementRef;
    @ViewChild('audioInput', {static: false}) audioInput: ElementRef;

    constructor() {
    }

    public toggleControls() {
        this.controlsEnabled = !this.controlsEnabled;
    }

    public handleFileUpload(event: any) {
        this.audioSource.nativeElement.src = URL.createObjectURL(event.target.files[0]);

        this.audioSource.nativeElement.play();
        this.startVisualizer();

        this.isWaveShown = true;
    }

    public playDemo() {
        this.audioSource.nativeElement.play();
        this.startVisualizer();

        this.isWaveShown = true;
    }

    public startVisualizer() {
        this._audioAnalyser = new NgModulo(this.audioSource.nativeElement);
        this._ctx = this.waveCanvas.nativeElement.getContext('2d');
        this.waveCanvas.nativeElement.width = window.innerWidth;
        this.waveCanvas.nativeElement.height = window.innerHeight;

        this.update();
    }

    public audioEnded() {
        URL.revokeObjectURL(this.audioSource.nativeElement.src);
    }

    public update() {
        const audioFreq = this._audioAnalyser.waveform();

        // Clear canvas
        this._ctx.fillStyle = 'black';
        this._ctx.fillRect(
            0, 0,
            this.waveCanvas.nativeElement.width,
            this.waveCanvas.nativeElement.height
        );

        // Set line style
        const scaleFactor = 0.8;

        this._ctx.strokeStyle = 'white';
        this._ctx.lineWidth = 1.5;

        // Draw frequency lines
        this._ctx.beginPath();
        this._ctx.moveTo(
            0,
            this.waveCanvas.nativeElement.height / 2 - audioFreq[0] * scaleFactor
        );

        for (let i = 0; i < audioFreq.length; i++) {
            this._ctx.lineTo(
                (this.waveCanvas.nativeElement.width / audioFreq.length) * i,
                this.waveCanvas.nativeElement.height / 2 - audioFreq[i] * scaleFactor
            );
        }

        this._ctx.moveTo(
            0,
            this.waveCanvas.nativeElement.height / 2 + audioFreq[0] * scaleFactor
        );

        for (let i = 0; i < audioFreq.length; i++) {
            this._ctx.lineTo(
                (this.waveCanvas.nativeElement.width / audioFreq.length) * i,
                this.waveCanvas.nativeElement.height / 2 + audioFreq[i] * scaleFactor
            );
        }

        this._ctx.stroke();

        window.requestAnimationFrame(() => this.update());
    }
}
