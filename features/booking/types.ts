export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  service_id: string;
  message: string;
}

export interface BookingResponse {
  status: boolean | string;
  message: string;
}
