import { useQuery } from '@tanstack/react-query';
import { getServices } from "../services/get-services";
import { getCountries } from "../services/get-countries";

export const useGetServices = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["services"],
        queryFn: getServices,
    });
    const { data: countries, isLoading: countriesLoading, error: countriesError } = useQuery({
        queryKey: ["countries"],
        queryFn: getCountries,
    });
    

    return { data, isLoading, error, countries, countriesLoading, countriesError };
};