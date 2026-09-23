<template>
    <div
        :class="$style.LoadingState"
        role="status"
        aria-live="polite"
    >
        <svg
            :class="$style.spinner"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle
                :class="$style.track"
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            />
            <circle
                :class="$style.indicator"
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>
        <span :class="$style.text">Загрузка данных…</span>
    </div>
</template>

<style module>
    .LoadingState {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        height: 100%;
    }

    .spinner {
        width: 2.5rem;
        height: 2.5rem;
    }

    .track {
        opacity: 0.16;
    }

    .indicator {
        stroke-dasharray: 42 58;
        transform-origin: center;
    }

    .text {
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    @media (prefers-reduced-motion: no-preference) {
        .indicator {
            animation: rotate 0.9s linear infinite;
        }
    }

    @keyframes rotate {
        to {
            transform: rotate(360deg);
        }
    }
</style>
