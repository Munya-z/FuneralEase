import { Text } from "@/partials";

export default function DeletedPage() {
  return (
    <div className="min-h-screen bg-warm-paper flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-dusk-ink/6 flex items-center justify-center mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-dusk-ink/40">
          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <Text as="h1" variant="heading_sub" className="mb-3">Account deleted</Text>
      <Text className="norm_dark_text max-w-xs text_faded mb-8" faded>
        Your account and all associated data have been scheduled for removal. A copy of your data was downloaded before deletion.
      </Text>
      <Text variant="body_small" superFaded>
        If you change your mind, you can create a new account at any time.
      </Text>
    </div>
  );
}
