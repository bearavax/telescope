"use client";

import { useEffect, useState, useCallback } from "react";

interface MintCountDownProps {your 
    end: number;
}

export function MintCountDown({ end }: MintCountDownProps): JSX.Element {
    const calculateTimeLeft = useCallback(() => {
        const now = Math.floor(Date.now() / 1000);
        const difference = Math.max(0, end - now);

        const hours = Math.floor(difference / 3600);
        const minutes = Math.floor((difference % 3600) / 60);
        const seconds = difference % 60;

        return { hours, minutes, seconds };
    }, [end]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    return (
        <div className="font-semibold text-[40px]">
            {timeLeft.hours}:{timeLeft.minutes.toString().padStart(2, "0")}:
            {timeLeft.seconds.toString().padStart(2, "0")}
        </div>
    );
}
