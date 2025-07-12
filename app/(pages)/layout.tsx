import { VerifyEmailBannerWrapper } from "@/_components/top-banners/verify-email-banner-wrapper";

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <VerifyEmailBannerWrapper />
    </>
  );
}
