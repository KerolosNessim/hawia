import { useQuery } from '@tanstack/react-query';
import { getServices } from "../services/get-services";

export const useGetServices = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["services"],
        queryFn: getServices,
    });

    return { data, isLoading, error };
};