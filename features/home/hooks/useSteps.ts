import { useQuery } from '@tanstack/react-query';
import { getStepsData } from "../services/steps";

export const useSteps = (countryId?: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["steps", countryId],
        queryFn: () => getStepsData(countryId),
    });

    return { data, isLoading, error };
};
