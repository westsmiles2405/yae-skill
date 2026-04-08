/**
 * 番茄钟计时器 — 神子风格
 */

import * as vscode from 'vscode';

export type PomodoroPhase = 'focus-end' | 'break-start' | 'break-end';

export class PomodoroTimer {
    private timer?: ReturnType<typeof setInterval>;
    private remaining = 0;
    private statusBarItem: vscode.StatusBarItem;
    private isBreak = false;
    private completed = 0;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100,
        );
    }

    public start(minutes: number, onTick: (text: string) => void, onFinish: (phase: PomodoroPhase) => void): void {
        this.stop();
        this.remaining = minutes * 60;
        this.isBreak = false;

        const config = vscode.workspace.getConfiguration('yae');
        const showStatus = config.get<boolean>('enableStatusBar', true);
        if (showStatus) {
            this.statusBarItem.show();
        }

        this.timer = setInterval(() => {
            this.remaining--;
            const display = this.formatTime(this.remaining);
            const prefix = this.isBreak ? '🦊 休憩' : '⚡ 专注';
            this.statusBarItem.text = `${prefix} ${display}`;
            onTick(`${prefix} ${display}`);

            if (this.remaining <= 0) {
                if (this.isBreak) {
                    this.stop();
                    onFinish('break-end');
                    return;
                }

                this.completed++;
                onFinish('focus-end');
                const breakMins = config.get<number>('breakMinutes', 5);
                this.remaining = breakMins * 60;
                this.isBreak = true;
                onFinish('break-start');
            }
        }, 1000);
    }

    public stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.statusBarItem.hide();
    }

    public get isRunning(): boolean {
        return this.timer !== undefined;
    }

    public get completedCount(): number {
        return this.completed;
    }

    public dispose(): void {
        this.stop();
        this.statusBarItem.dispose();
    }

    private formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
}
