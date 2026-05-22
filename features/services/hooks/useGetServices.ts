import { useQuery } from '@tanstack/react-query';
import { useLocale } from "next-intl";
import { getServices } from "../services/get-services";
import { getCountries } from "../services/get-countries";

export const useGetServices = () => {
    const locale = useLocale();
    const { data, isLoading, error } = useQuery({
        queryKey: ["services", locale],
        queryFn: getServices,
    });
    const { data: countries, isLoading: countriesLoading, error: countriesError } = useQuery({
        queryKey: ["countries", locale],
        queryFn: getCountries,
    });
    

    return { data, isLoading, error, countries, countriesLoading, countriesError };
};