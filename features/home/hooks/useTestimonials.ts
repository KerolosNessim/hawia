import { useQuery } from '@tanstack/react-query';
import { getTestimonialsData } from "../services/testimonials";

export const useTestimonials = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["testimonials"],
        queryFn: getTestimonialsData,
    });

    return { data, isLoading, error };
};
