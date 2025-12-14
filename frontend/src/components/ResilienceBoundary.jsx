import { Component } from "react";

const AUTO_RELOAD_DELAY = 4000;
const CHUNK_ERROR_REGEX = /Loading chunk [\d]+ failed|chunkLoadError|chunk/i;

class ResilienceBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            message: "",
            reloadDelay: AUTO_RELOAD_DELAY,
        };
        this.reloadTimer = null;
    }

    componentDidCatch(error) {
        const message = error?.message || "Произошла непредвиденная ошибка.";
        this.triggerRecovery(message);
    }

    componentDidMount() {
        this.unhandledRejectionHandler = (event) => {
            const reason = event?.reason;
            const message = reason?.message || "";
            const isChunkLoadError =
                reason?.name === "ChunkLoadError" || CHUNK_ERROR_REGEX.test(message);

            if (isChunkLoadError) {
                this.triggerRecovery(
                    "Не удалось загрузить интерфейс. Страница будет перезагружена…",
                    800
                );
            }
        };

        this.windowErrorHandler = (event) => {
            const message = event?.message || "";
            const isChunkLoadError = CHUNK_ERROR_REGEX.test(message);
            if (isChunkLoadError) {
                this.triggerRecovery(
                    "Ошибка загрузки приложения. Обновляем страницу…",
                    800
                );
            }
        };

        window.addEventListener("unhandledrejection", this.unhandledRejectionHandler);
        window.addEventListener("error", this.windowErrorHandler);
    }

    componentWillUnmount() {
        window.removeEventListener("unhandledrejection", this.unhandledRejectionHandler);
        window.removeEventListener("error", this.windowErrorHandler);
        if (this.reloadTimer) clearTimeout(this.reloadTimer);
    }

    triggerRecovery(message, delay = AUTO_RELOAD_DELAY) {
        this.setState({ hasError: true, message, reloadDelay: delay });
        this.scheduleReload(delay);
    }

    scheduleReload(delay) {
        if (this.reloadTimer) return;
        this.reloadTimer = setTimeout(() => window.location.reload(), delay);
    }

    handleReload = () => {
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = null;
        }
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0f172a",
                        color: "#e2e8f0",
                        padding: "32px",
                        textAlign: "center",
                        gap: "16px",
                    }}
                >
                    <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
                        Приложение перезапускается
                    </h1>
                    <p style={{ maxWidth: 520, lineHeight: 1.5 }}>{this.state.message}</p>
                    <p style={{ opacity: 0.8 }}>
                        Автоматическое обновление через {Math.ceil(this.state.reloadDelay / 1000)}
                         с.
                    </p>
                    <button
                        type="button"
                        onClick={this.handleReload}
                        style={{
                            background: "#38bdf8",
                            color: "#0f172a",
                            border: "none",
                            borderRadius: "9999px",
                            padding: "12px 20px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 10px 25px rgba(56, 189, 248, 0.35)",
                        }}
                    >
                        Перезагрузить сейчас
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ResilienceBoundary;
