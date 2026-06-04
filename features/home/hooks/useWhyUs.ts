import { useQuery } from '@tanstack/react-query';
import { getWhyUsData } from "../services/why-us";

export const useWhyUs = (countryId?: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["why-us", countryId],
        queryFn: () => getWhyUsData(countryId),
    });

    return { data, isLoading, error };
};
