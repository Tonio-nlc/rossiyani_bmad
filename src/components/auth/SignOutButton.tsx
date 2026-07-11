import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-border text-ink-2 hover:text-ink"
      >
        Déconnexion
      </Button>
    </form>
  );
}
