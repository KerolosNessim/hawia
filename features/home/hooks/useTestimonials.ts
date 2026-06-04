import { useQuery } from '@tanstack/react-query';
import { getTestimonialsData } from "../services/testimonials";

export const useTestimonials = (countryId?: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["testimonials", countryId],
        queryFn: () => getTestimonialsData(countryId),
    });

    return { data, isLoading, error };
};
