"use client";
import LoginButton from "@/components/LoginButton";
import { Show, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";

function HeaderProfileBtn() {
  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Profile"
            labelIcon={<User className="size-4" />}
            href="/profile"
          />
        </UserButton.MenuItems>
      </UserButton>

      <Show when="signed-out">
        <LoginButton />
      </Show>
    </>
  );
}
export default HeaderProfileBtn;
