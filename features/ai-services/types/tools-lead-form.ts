export type AiToolsLeadFormCopy = {
  title: string;
  challenge_placeholder: string;
  email_placeholder: string;
  consent_text: string;
  submit_button_text: string;
  ai_tools_button_text: string;
};

export type AiToolsLeadSubmitPayload = {
  challenge: string;
  email: string;
  accepts_updates: boolean;
};
