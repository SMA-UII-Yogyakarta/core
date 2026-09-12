import { useState } from "react";
import {
    FiActivity,
    FiCheck,
    FiCpu,
    FiHelpCircle,
    FiInfo,
    FiRefreshCw,
    FiSend,
    FiServer,
    FiShield,
    FiTerminal,
} from "react-icons/fi";
import Button from "@/Components/ui/Button";
import Input from "@/Components/ui/Input";
import NativeSelect from "@/Components/ui/NativeSelect";
import { pingAgentConnection, type AgentPingResponse } from "@/services/errorReporter";

export default function AgentIntegrationSection() {
    const [agentProvider, setAgentProvider] = useState<string>("auto");
    const [agentUrl, setAgentUrl] = useState<string>("http://localhost:18789");
    const [agentSecret, setAgentSecret] = useState<string>("");
    const [deploymentMode, setDeploymentMode] = useState<string>("docker");
    const [showOnboarding, setShowOnboarding] = useState<boolean>(true);

    const [pinging, setPinging] = useState<boolean>(false);
    const [pingResult, setPingResult] = useState<AgentPingResponse | null>(null);

    const handleTestConnection = async () => {
        setPinging(true);
        setPingResult(null);
        try {
            const res = await pingAgentConnection({
                url: agentUrl,
                provider: agentProvider,
                secret: agentSecret,
                deploymentMode,
            });
            setPingResult(res);
        } catch (err) {
            setPingResult({
                success: false,
                detected_agent: "Offline",
                http_status: 0,
                latency_ms: 0,
                target_url: agentUrl,
                message: (err as Error).message || "Gagal menghubungi target URL Agent.",
            });
        } finally {
            setPinging(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 pt-4 border-t border-border font-inter">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-bold text-text-primary flex items-center gap-2">
                        <FiCpu className="text-primary text-[17px]" />
                        <span>Integrasi Agent AI (Hermes Agent / OpenClaw)</span>
                    </h3>
                    <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                        Konfigurasi endpoint telemetri otomatis ke agen AI sekolah untuk penanganan insiden error secara otomatis.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowOnboarding((prev) => !prev)}
                    className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                    <FiHelpCircle className="w-3.5 h-3.5" />
                    <span>{showOnboarding ? "Sembunyikan Panduan" : "Panduan & Edukasi Agent"}</span>
                </button>
            </div>

            {/* Onboarding & Educational Guide Box */}
            {showOnboarding && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-[12.5px] text-text-secondary leading-relaxed animate-fadeIn">
                    <div className="flex items-center gap-2 text-primary font-bold text-[13.5px]">
                        <FiInfo className="w-4 h-4 shrink-0" />
                        <span>Edukasi & Perbandingan Arsitektur Agent AI Sekolah</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hermes Agent Box */}
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[13px] text-text-primary flex items-center gap-1.5">
                                    <FiTerminal className="text-accent" />
                                    Hermes Agent
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent-hover border border-accent/30">
                                    CLI / Code Debugger
                                </span>
                            </div>
                            <p className="text-[11.5px] text-text-secondary">
                                Agen AI independen berbasis CLI/Docker yang dirancang khusus untuk inspeksi kode cepat, analisis stack trace berkas tunggal, dan patching bug instan.
                            </p>
                            <div className="text-[11px] space-y-1 pt-1 text-text-muted">
                                <div><strong className="text-text-primary">Kelebihan:</strong> Sangat ringan (&lt; 250MB RAM), respon instan, eksekusi lokal aman.</div>
                                <div><strong className="text-text-primary">Kekurangan:</strong> Terfokus pada inspeksi kode lokal, belum ada bot multi-channel.</div>
                                <div><strong className="text-text-primary">Best Practice Deploy:</strong> Docker Container di host lokal (`http://localhost:18789`).</div>
                            </div>
                        </div>

                        {/* OpenClaw Box */}
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-[13px] text-text-primary flex items-center gap-1.5">
                                    <FiShield className="text-primary" />
                                    OpenClaw AI Engine
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                                    Enterprise Multi-Agent
                                </span>
                            </div>
                            <p className="text-[11.5px] text-text-secondary">
                                Framework orchestrator AI multi-agent skala institusi yang mendukung webhook multi-channel (Discord, Slack, Telegram, WhatsApp) &amp; alur insiden kompleks.
                            </p>
                            <div className="text-[11px] space-y-1 pt-1 text-text-muted">
                                <div><strong className="text-text-primary">Kelebihan:</strong> Fitur lengkap, multi-bot, riwayat insiden terpusat &amp; workflow fleksibel.</div>
                                <div><strong className="text-text-primary">Kekurangan:</strong> Membutuhkan resource RAM &amp; database sedikit lebih tinggi.</div>
                                <div><strong className="text-text-primary">Best Practice Deploy:</strong> Docker Stack pada server terpisah (`http://openclaw:3000`).</div>
                            </div>
                        </div>
                    </div>

                    {/* Best Practice Docker Box */}
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/80 flex items-start gap-2.5 text-[11.5px]">
                        <FiServer className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-text-primary font-bold">Prinsip Clean Architecture &amp; Self-Hosted Docker:</strong>
                            <p className="text-text-muted mt-0.5">
                                Apapun pilihan agen AI sekolah Anda (Hermes maupun OpenClaw), disarankan untuk **membungkus agen di dalam Docker Container** (`docker run -p 18789:18789 ...`). Dengan arsitektur ini, agen dapat di-host di mana pun (Lokal Host, Docker Bridge Network, ataupun Remote Server) dengan Endpoint Universal `/api/v1/agent/report-error`.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Interactive Configuration Form */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[12.5px] font-bold text-text-primary mb-1.5">
                            Provider Agent AI
                        </label>
                        <NativeSelect value={agentProvider} onChange={(e) => setAgentProvider(e.target.value)}>
                            <option value="auto">Otomatis Deteksi (Auto-Detect)</option>
                            <option value="openclaw">OpenClaw AI Control Engine</option>
                            <option value="hermes">Hermes Agent CLI Engine</option>
                            <option value="custom">Custom Webhook Endpoint</option>
                            <option value="disabled">Nonaktif / Off</option>
                        </NativeSelect>
                    </div>

                    <div>
                        <label className="block text-[12.5px] font-bold text-text-primary mb-1.5">
                            Lokasi Deploy Agent
                        </label>
                        <NativeSelect value={deploymentMode} onChange={(e) => setDeploymentMode(e.target.value)}>
                            <option value="docker">Docker Container (Local Host)</option>
                            <option value="localhost">Direct Local Host Binary</option>
                            <option value="remote">Remote Cluster Server (Cloud/LAN)</option>
                        </NativeSelect>
                    </div>

                    <Input
                        label="URL Webhook / Host Agent"
                        type="url"
                        value={agentUrl}
                        onChange={(e) => setAgentUrl(e.target.value)}
                        placeholder="http://localhost:18789"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <Input
                        label="Secret Header Key / Authorization Token (Opsional)"
                        type="password"
                        value={agentSecret}
                        onChange={(e) => setAgentSecret(e.target.value)}
                        placeholder="Masukkan token jika agen menggunakan proteksi header..."
                    />

                    <div className="flex flex-col justify-end">
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleTestConnection}
                            loading={pinging}
                            icon={<FiSend className="w-4 h-4" />}
                            className="h-10 font-bold text-[13px] justify-center w-full"
                        >
                            Tes Koneksi &amp; Ping Agent AI
                        </Button>
                    </div>
                </div>

                {/* Diagnostic Live Ping Result */}
                {pingResult && (
                    <div
                        className={`p-3.5 rounded-xl border text-[12px] font-mono flex items-start gap-3 transition-all animate-fadeIn ${
                            pingResult.success
                                ? "bg-success-bg border-success/30 text-success"
                                : "bg-danger/10 border-danger/30 text-danger"
                        }`}
                    >
                        {pingResult.success ? (
                            <FiCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        ) : (
                            <FiActivity className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="font-bold flex items-center justify-between gap-2 flex-wrap">
                                <span>{pingResult.detected_agent}</span>
                                <span className="px-2 py-0.5 rounded-md text-[10.5px] bg-surface font-semibold border">
                                    Latency: {pingResult.latency_ms} ms | Status: {pingResult.http_status}
                                </span>
                            </div>
                            <p className="text-[11.5px] opacity-90 break-words font-inter">{pingResult.message}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
