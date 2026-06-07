export type ApplicationSeoFormCopy = {
  heading: string;
  website_placeholder: string;
  email_placeholder: string;
  consent_text: string;
  submit_button_text: string;
};

export type ApplicationSeoConfig = {
  copy: ApplicationSeoFormCopy;
  serviceIds: number[];
};

export type ApplicationSeoSubmitPayload = {
  service_id: number;
  website_url: string;
  email: string;
  consent: boolean;
};
