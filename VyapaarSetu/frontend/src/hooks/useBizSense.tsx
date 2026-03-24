import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "sonner";

export const BizSenseContext = createContext<any>(null);

export const BizSenseProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();

    const { data: apiData = [], refetch: refetchData, isLoading: isLoadingData } = useQuery({
        queryKey: ['bizData'],
        queryFn: async () => {
            const res = await fetch('/api/data');
            const json = await res.json();
            return json.data || [];
        }
    });

    const { data: anomalies = null } = useQuery({
        queryKey: ['anomalies'],
        queryFn: async () => {
            const res = await fetch('/api/anomalies');
            const json = await res.json();
            return json.data || null;
        }
    });

    const [forecastResult, setForecastResult] = useState<any>(null);

    const forecastMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/forecast', { method: 'POST' });
            return await res.json();
        },
        onSuccess: (data) => {
            if (data.status === 'success') {
                setForecastResult(data.data);
                toast.success("AI Strategy Generated!");
            } else {
                toast.error(data.message || "Failed to generate strategy");
            }
        },
        onError: () => {
            toast.error("Network error generated strategy.");
        }
    });

    return (
        <BizSenseContext.Provider value={{
            data: apiData,
            isLoadingData,
            anomalies,
            refetchData,
            forecastResult,
            forecastMutation
        }}>
            {children}
        </BizSenseContext.Provider>
    );
};

export const useBizSense = () => useContext(BizSenseContext);
