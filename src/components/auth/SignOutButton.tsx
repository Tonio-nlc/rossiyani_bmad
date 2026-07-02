import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-brand-border text-brand-text-secondary hover:text-brand-text-primary"
      >
        Déconnexion
      </Button>
    </form>
  );
}
