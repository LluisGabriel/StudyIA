'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocale } from "@/hooks/use-locale";

const MAX_IMAGE_SIZE_MB = 2;

export default function SettingsPage() {
  const { toast } = useToast();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    try {
        const savedName = localStorage.getItem('userName') || '';
        const savedEmail = localStorage.getItem('userEmail') || '';
        const savedAvatar = localStorage.getItem('userAvatar');
        
        setName(savedName);
        setEmail(savedEmail);
        if (savedAvatar) setProfilePicturePreview(savedAvatar);
    } catch (error) {
        console.error("Could not access localStorage:", error);
        toast({
            variant: "destructive",
            title: t('toast.error'),
            description: t('toast.loadingError'),
        });
    }
  }, [toast, t]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: t('toast.error'),
          description: t('toast.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }),
        });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
        toast({
            variant: "destructive",
            title: t('toast.error'),
            description: t('toast.nameInvalid'),
        });
        return;
    }
    
    try {
        localStorage.setItem('userName', trimmedName);
        localStorage.setItem('userEmail', email.trim());
        if (profilePicturePreview) {
            localStorage.setItem('userAvatar', profilePicturePreview);
        } else {
            localStorage.removeItem('userAvatar');
        }

        // Dispatch a custom event to notify the layout that user data has changed
        window.dispatchEvent(new CustomEvent('user-data-updated'));

        toast({
          title: t('toast.success'),
          description: t('toast.infoSaved'),
        });

        if (currentPassword && newPassword) {
            // Here you would typically call an API to update the password.
            // For this demo, we'll just show a toast.
            toast({
                title: t('toast.success'),
                description: t('toast.passwordUpdated'),
            });
            setCurrentPassword("");
            setNewPassword("");
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
        toast({
            variant: "destructive",
            title: t('toast.error'),
            description: t('toast.saveError'),
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-bold">Configuración</h1>
      </div>
      <p className="text-muted-foreground">
        Gestiona la configuración de tu cuenta y personaliza tu experiencia en StudyAI.
      </p>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal y foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePicturePreview || undefined} alt={name} />
                  <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1.5">
                  <Label htmlFor="profile-picture-input">Foto de Perfil</Label>
                   <Input id="profile-picture-input" type="file" accept="image/*" onChange={handleProfilePictureChange} className="w-full max-w-xs"/>
              </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Seguridad</CardTitle>
          <CardDescription>Cambia tu contraseña.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

       <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
       </div>
    </div>
  );
}