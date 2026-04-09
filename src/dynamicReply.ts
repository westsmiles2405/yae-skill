/**
 * 八重神子动态回复引擎 — 关键词意图识别 + 总编式响应
 */

import * as vscode from 'vscode';
import {
    getComfort,
    getEditorial,
    getEncourageLine,
    getPlotTwist,
    getRaidenEasterEgg,
    getSolemnComfort,
    getTimeBasedGreeting,
    getWorkLine,
} from './persona';

const DEEP_SAD_KEYWORDS = ['想死', '活不下去', '没意义', '太痛苦', '撑不住', '不想活', '毫无希望'];
const SAD_KEYWORDS = ['难过', '伤心', '烦', '累', '焦虑', '失败', '崩溃', '郁闷', '想放弃'];
const WORK_KEYWORDS = ['代码', '编程', 'bug', 'debug', '重构', '优化', '需求', '测试', '部署'];
const ENCOURAGE_KEYWORDS = ['加油', '鼓励', '建议', '支持', '没动力', '坚持'];
const GREETING_KEYWORDS = ['你好', '早上好', '晚上好', 'hi', 'hello', '神子'];
const EDITORIAL_KEYWORDS = ['总编', '点评', '审稿', '稿子', '编辑'];
const PLOT_TWIST_KEYWORDS = ['反转', '脑洞', '剧情', '小说', '点子'];
const RAIDEN_KEYWORDS = ['影', '雷电将军', '雷电影', '将军'];
export const CODE_ANALYSIS_KEYWORDS = ['分析', '诊断', '检查代码', '代码质量', '有没有错'];

type Intent =
    | 'deep_sad'
    | 'sad'
    | 'work'
    | 'encourage'
    | 'greeting'
    | 'editorial'
    | 'plot'
    | 'raiden'
    | 'unknown';

function analyzeIntent(text: string): Intent {
    const lower = text.toLowerCase();
    if (DEEP_SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'deep_sad'; }
    if (EDITORIAL_KEYWORDS.some((k) => lower.includes(k))) { return 'editorial'; }
    if (PLOT_TWIST_KEYWORDS.some((k) => lower.includes(k))) { return 'plot'; }
    if (RAIDEN_KEYWORDS.some((k) => lower.includes(k))) { return 'raiden'; }
    if (SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'sad'; }
    if (ENCOURAGE_KEYWORDS.some((k) => lower.includes(k))) { return 'encourage'; }
    if (WORK_KEYWORDS.some((k) => lower.includes(k))) { return 'work'; }
    if (GREETING_KEYWORDS.some((k) => lower.includes(k))) { return 'greeting'; }
    return 'unknown';
}

function extractInfo(text: string): { type: string; detail: string } {
    const lower = text.toLowerCase();
    if (lower.includes('报错') || lower.includes('error') || lower.includes('bug')) {
        return { type: 'bug', detail: '先别慌。报错信息往往像伏笔，丑是丑了点，但通常藏着关键线索。' };
    }
    if (lower.includes('deadline') || lower.includes('来不及') || lower.includes('赶')) {
        return { type: 'deadline', detail: '赶工时最忌乱改。先抓主线，再决定哪些支线可以删。' };
    }
    if (lower.includes('同事') || lower.includes('老板') || lower.includes('领导')) {
        return { type: 'people', detail: '人情世故比代码更爱埋伏笔。别急，先看清对方真正想要什么。' };
    }
    return { type: 'general', detail: '' };
}

export function generateResponse(userMessage: string): string {
    const intent = analyzeIntent(userMessage);
    const info = extractInfo(userMessage);

    switch (intent) {
        case 'deep_sad':
            return getSolemnComfort();
        case 'sad':
            return info.detail ? `${getComfort()}\n\n${info.detail}` : getComfort();
        case 'encourage':
            return getEncourageLine();
        case 'work':
            return info.detail ? `${getWorkLine()}\n\n${info.detail}` : getWorkLine();
        case 'greeting':
            return getTimeBasedGreeting();
        case 'editorial':
            return getEditorial();
        case 'plot':
            return getPlotTwist();
        case 'raiden':
            return getRaidenEasterEgg();
        default: {
            const responses = [
                '这句话有点意思，只是还不够完整。要不要再展开一点？',
                '呵，小家伙，你是想试探我，还是想认真聊问题？',
                '如果你把重点说清楚，我也许会更愿意给出漂亮些的回答。',
                '我在听。别像轻小说烂尾那样突然断在关键处。',
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
}

export function analyzeCodeProblems(): string {
    const diagnostics = vscode.languages.getDiagnostics();
    let errors = 0;
    let warnings = 0;
    const issues: string[] = [];

    for (const [uri, diags] of diagnostics) {
        for (const diag of diags) {
            if (diag.severity === vscode.DiagnosticSeverity.Error) {
                errors++;
                if (issues.length < 5) {
                    issues.push(`🦊 [${uri.path.split('/').pop()}:${diag.range.start.line + 1}] ${diag.message}`);
                }
            } else if (diag.severity === vscode.DiagnosticSeverity.Warning) {
                warnings++;
            }
        }
    }

    if (errors === 0 && warnings === 0) {
        return '哦？诊断区一片安静。这份稿子居然不用我退回重写，稀奇。';
    }

    const summary =
        errors > 0
            ? `我替你翻了翻稿子，发现 ${errors} 处错误、${warnings} 处警告。问题确实写在脸上了。`
            : `只有 ${warnings} 处警告。倒不至于退稿，但离刊登还有点距离。`;

    const list = issues.length > 0 ? `\n\n${issues.join('\n')}` : '';
    const advice =
        errors > 3
            ? '\n\n别想着一口气改完全部内容。像修稿一样，先从最影响主线的那几处下手。'
            : '\n\n问题不算太多，认真一点，很快就能修好。';

    return `${summary}${list}${advice}`;
}
