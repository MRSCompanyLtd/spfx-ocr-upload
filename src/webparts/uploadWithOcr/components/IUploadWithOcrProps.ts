import { SPFI } from "@pnp/sp";

export interface IUploadWithOcrProps {
  title: string;
  sp: SPFI;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
