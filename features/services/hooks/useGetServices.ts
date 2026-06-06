import { useQuery } from '@tanstack/react-query';
import { useMemo } from "react";
import { useLocale } from "next-intl";
import { getServices } from "../services/get-services";
import { getCountries } from "../services/get-countries";

export const useGetServices = (countryId?: number) => {
    const locale = useLocale();
    const { data, isLoading, error } = useQuery({
        queryKey: ["services", locale, countryId],
        queryFn: () => getServices(locale, { country_id: countryId }),
    });
    const { data: countries, isLoading: countriesLoading, error: countriesError } = useQuery({
        queryKey: ["countries", locale],
        queryFn: getCountries,
    });

    const countriesData = useMemo(
        () => (Array.isArray(countries?.data) ? countries.data : []),
        [countries?.data],
    );
    const countryIdAlias = useMemo(
        () => countries?.idAlias ?? new Map<number, number>(),
        [countries?.idAlias],
    );

    return {
        data,
        isLoading,
        error,
        countries,
        countriesData,
        countryIdAlias,
        countriesLoading,
        countriesError,
    };
};
