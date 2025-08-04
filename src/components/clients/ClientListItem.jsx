import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Eye, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ClientListItem = ({ client, onOpenDetails, onOpenForm, onDelete }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground border-border">
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${client.email || client.name}.png?size=40`} alt={client.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-md leading-tight">{client.name}</h3>
                  {client.cpf && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <User className="h-3 w-3 mr-1" /> {client.cpf}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground mb-3">
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </p>
              {client.email && (
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </p>
              )}
            </div>

            {client.notes && (
              <p className="text-xs italic text-muted-foreground/80 border-t border-border/50 pt-2 mt-2 truncate">
                {client.notes}
              </p>
            )}
          </div>

          <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/50">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1 text-xs hover:bg-primary/10 text-primary"
              onClick={() => onOpenDetails(client)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Ver
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1 text-xs hover:bg-muted text-muted-foreground"
              onClick={() => onOpenForm(client)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs hover:bg-destructive/10 text-destructive"
              onClick={() => onDelete(client.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClientListItem;