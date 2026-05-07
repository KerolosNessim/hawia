import { useQuery } from '@tanstack/react-query';
import { getWhyUsData } from "../services/why-us";

export const useWhyUs = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["why-us"],
        queryFn: getWhyUsData,
    });

    return { data, isLoading, error };
};