/**
 * 八重神子工作陪伴 — 主入口
 */

import * as vscode from 'vscode';
import { YaeChatPanel } from './chatPanel';
import { generateResponse, analyzeCodeProblems, CODE_ANALYSIS_KEYWORDS } from './dynamicReply';
import { IdleWatcher } from './idleWatcher';
import {
    getBreakRemind,
    getEditorial,
    getEncourageLine,
    getFinale,
    getFocusEnd,
    getFocusStart,
    getIdleRemind,
    getJudgment,
    getOpening,
    getPlotTwist,
    getRaidenEasterEgg,
    getTimeBasedGreeting,
    getWorkLine,
} from './persona';
import { PomodoroTimer } from './pomodoro';
import { StatsTracker } from './stats';

export function activate(context: vscode.ExtensionContext): void {
    const panel = new YaeChatPanel(context.extensionUri);
    const pomodoro = new PomodoroTimer();
    const stats = new StatsTracker(context.globalState);
    const idleWatcher = new IdleWatcher(() => {
        panel.addBotMessage(getIdleRemind());
    });

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '🦊 神子';
    statusBar.tooltip = '八重神子工作陪伴';
    statusBar.command = 'yae.openStage';
    if (vscode.workspace.getConfiguration('yae').get<boolean>('enableStatusBar', true)) {
        statusBar.show();
    }
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(YaeChatPanel.viewType, panel),
    );

    panel.setOnUserMessage((text) => {
        stats.recordMessage();
        panel.updateStats(stats.current);
        idleWatcher.reset();

        const lower = text.toLowerCase();
        if (CODE_ANALYSIS_KEYWORDS.some((keyword) => lower.includes(keyword))) {
            panel.addBotMessage(analyzeCodeProblems());
            return;
        }

        panel.addBotMessage(generateResponse(text));
    });

    const welcomed = context.globalState.get<boolean>('yae.welcomed', false);
    if (!welcomed) {
        panel.addBotMessage('哎呀，小家伙，欢迎来到鸣神案台。今天开始，我来替你盯着这些稿子。');
        panel.addBotMessage('你可以让我审稿式看代码、开番茄钟，或者给你一点像样的反转灵感。');
        panel.addBotMessage('试试在命令面板里搜索“神子”，或者直接在这里和我说话。');
        void context.globalState.update('yae.welcomed', true);
    } else {
        panel.addBotMessage(getTimeBasedGreeting());
    }
    panel.updateStats(stats.current);

    context.subscriptions.push(
        vscode.commands.registerCommand('yae.openStage', () => {
            const msg = getOpening();
            panel.addBotMessage(msg);
            panel.addBotMessage(getTimeBasedGreeting());
            void vscode.window.showInformationMessage(`🦊 神子：${msg}`);
        }),
        vscode.commands.registerCommand('yae.startPomodoro', () => {
            if (pomodoro.isRunning) {
                panel.addBotMessage('番茄钟已经开始了。别想着一边开着计时一边走神哦。');
                return;
            }

            const minutes = vscode.workspace.getConfiguration('yae').get<number>('pomodoroMinutes', 25);
            panel.addBotMessage(getFocusStart(minutes));
            pomodoro.start(
                minutes,
                () => { },
                (phase) => {
                    if (phase === 'focus-end') {
                        panel.addBotMessage(getFocusEnd());
                        stats.recordPomodoro();
                        panel.updateStats(stats.current);
                        void vscode.window.showInformationMessage('🦊 神子：这一轮写得还行，先休息一会儿。');
                        return;
                    }

                    if (phase === 'break-start') {
                        panel.addBotMessage(getBreakRemind());
                        void vscode.window.showInformationMessage('🦊 神子：休息时间到了，别把脑子写钝了。');
                        return;
                    }

                    panel.addBotMessage('休息结束。好了，小家伙，下一章该继续了。');
                    void vscode.window.showInformationMessage('🦊 神子：休息结束，该回来写正篇了。');
                },
            );
        }),
        vscode.commands.registerCommand('yae.stopPomodoro', () => {
            if (!pomodoro.isRunning) {
                panel.addBotMessage('番茄钟还没开始呢。别连计时都想靠想象推进呀。');
                void vscode.window.showInformationMessage('🦊 神子：番茄钟尚未开始。');
                return;
            }
            pomodoro.stop();
            panel.addBotMessage('好吧，这一轮就先到这里。别把停下也演成拖稿。');
            void vscode.window.showInformationMessage('🦊 神子：番茄钟已结束。');
        }),
        vscode.commands.registerCommand('yae.encourageMe', () => {
            const msg = getEncourageLine();
            panel.addBotMessage(msg);
            void vscode.window.showInformationMessage(`🦊 神子：${msg}`);
        }),
        vscode.commands.registerCommand('yae.reviewWork', () => {
            const diagnostics = vscode.languages.getDiagnostics();
            const issues: string[] = [];
            for (const [uri, diags] of diagnostics) {
                for (const diag of diags) {
                    if (diag.severity === vscode.DiagnosticSeverity.Error) {
                        const fileName = vscode.workspace.asRelativePath(uri);
                        issues.push(`${fileName}:${diag.range.start.line + 1} — ${diag.message}`);
                    }
                }
            }
            const totalIssues = issues.length;
            const topIssues = issues.slice(0, 10);
            if (totalIssues > 10) {
                topIssues.push(`……以及另外 ${totalIssues - 10} 处问题。`);
            }
            panel.addBotMessage(getJudgment(topIssues));
            void vscode.window.showInformationMessage(`🦊 神子：我替你挑出了 ${totalIssues} 处错误。`);
        }),
        vscode.commands.registerCommand('yae.finale', () => {
            const msg = getFinale(pomodoro.completedCount);
            panel.addBotMessage(msg);
            pomodoro.stop();
            void vscode.window.showInformationMessage(`🦊 神子：${msg}`);
        }),
        vscode.commands.registerCommand('yae.editorial', () => {
            panel.addBotMessage(getEditorial());
        }),
        vscode.commands.registerCommand('yae.plotTwist', () => {
            panel.addBotMessage(getPlotTwist());
        }),
        vscode.commands.registerCommand('yae.raiden', () => {
            panel.addBotMessage(getRaidenEasterEgg());
        }),
        vscode.workspace.onDidSaveTextDocument(() => {
            stats.recordSave();
            panel.updateStats(stats.current);
            idleWatcher.reset();
            if (stats.current.todaySaves % 10 === 0) {
                panel.addBotMessage(getWorkLine());
            }
        }),
        vscode.workspace.onDidChangeTextDocument(() => {
            idleWatcher.reset();
        }),
        vscode.window.onDidChangeActiveTextEditor(() => {
            idleWatcher.reset();
        }),
        {
            dispose() {
                pomodoro.dispose();
                idleWatcher.dispose();
            },
        },
    );
}

export function deactivate(): void { }
