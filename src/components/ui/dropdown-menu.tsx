"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react";

import { Tooltip } from "@/components/ui/tooltip";

export interface DropdownMenuItem {
  label: string;
  href: string;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  tooltipLabel?: string;
  items: DropdownMenuItem[];
}

export function DropdownMenu({ trigger, tooltipLabel, items }: DropdownMenuProps) {
  const triggerEl = (
    <Menu.Trigger className="hover:text-brand-blue flex items-center text-gray-600">
      {trigger}
    </Menu.Trigger>
  );

  return (
    <Menu.Root modal={false}>
      {tooltipLabel ? (
        <Tooltip label={tooltipLabel}>{triggerEl}</Tooltip>
      ) : (
        triggerEl
      )}

      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={12} className="z-[60]">
          <Menu.Popup className="min-w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg outline-none">
            {items.map(({ label, href }) => (
              <Menu.Item
                key={href}
                render={<Link href={href} />}
                className="block px-4 py-2.5 text-sm text-gray-700 outline-none hover:bg-gray-50 data-highlighted:bg-gray-50"
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
