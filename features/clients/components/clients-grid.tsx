"use client";

import { useState } from "react";
import ClientCard from "@/features/clients/components/client-card";
import ClientDetailDialog from "@/features/clients/components/client-detail-dialog";
import type { PublicClientCard } from "@/features/clients/services/clients-public-api";

type Props = {
  clients: PublicClientCard[];
};

export default function ClientsGrid({ clients }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<PublicClientCard | null>(
    null,
  );

  const openClient = (client: PublicClientCard) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="grid auto-rows-fr grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onOpen={openClient}
          />
        ))}
      </div>

      <ClientDetailDialog
        client={selectedClient}
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) setSelectedClient(null);
        }}
      />
    </>
  );
}
