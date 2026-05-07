import { useQuery } from '@tanstack/react-query';
import { getStepsData } from "../services/steps";

export const useSteps = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["steps"],
        queryFn: getStepsData,
    });

    return { data, isLoading, error };
};