import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PawPrint,
  Search,
  MapPin,
  Heart,
  MessageCircle,
  Shield,
  Star,
  ArrowRight,
  CalendarDays,
  Users,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  HeroAnimation,
  ScrollSection,
  StaggerGrid,
  StaggerCard,
  AnimatedCounter,
} from "@/components/landing/animated-sections";

const features = [
  {
    icon: Search,
    title: "Busca Servicios",
    description:
      "Encuentra paseadores, cuidadores y guarderias cercanas con resenas verificadas.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: MapPin,
    title: "Veterinarias 24/7",
    description:
      "Mapa interactivo con clinicas veterinarias cercanas, abiertas ahora o las 24 horas.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Heart,
    title: "PetMatch",
    description:
      "Desliza para encontrar amigos para tu mascota. Paseos compartidos, juegos y socializacion.",
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    icon: MessageCircle,
    title: "Chat Integrado",
    description:
      "Comunicate directamente con paseadores, cuidadores y otros duenos de mascotas.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: CalendarDays,
    title: "Reservas Faciles",
    description:
      "Agenda servicios con fecha, hora y pago seguro desde la plataforma.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Shield,
    title: "Seguro y Confiable",
    description:
      "Perfiles verificados, resenas reales y soporte para que tu mascota este siempre segura.",
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
];

const testimonials = [
  {
    name: "Maria G.",
    role: "Duena de Luna",
    text: "Encontre al mejor paseador para mi perrita. Ahora Luna sale feliz todos los dias!",
    rating: 5,
  },
  {
    name: "Carlos R.",
    role: "Paseador profesional",
    text: "PetMatch me ayudo a crecer mi negocio. Tengo clientes fijos y excelentes resenas.",
    rating: 5,
  },
  {
    name: "Ana P.",
    role: "Duena de Max y Coco",
    text: "El PetMatch es genial! Mis perros encontraron amigos para jugar en el parque.",
    rating: 5,
  },
];

export default async function LandingPage() {
  const [verifiedProviders, completedServices, avgRating, userCount, featuredProviders] =
    await Promise.all([
      prisma.providerProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.user.count(),
      prisma.providerProfile.findMany({
        where: { verificationStatus: "VERIFIED", isActive: true },
        include: {
          user: { select: { name: true, avatarUrl: true, city: true } },
        },
        orderBy: { averageRating: "desc" },
        take: 3,
      }),
    ]);

  const platformStats = [
    { label: "Usuarios registrados", value: userCount, icon: Users },
    { label: "Proveedores verificados", value: verifiedProviders, icon: Shield },
    { label: "Servicios completados", value: completedServices, icon: CheckCircle },
    {
      label: "Rating promedio",
      value: avgRating._avg.rating ? `${avgRating._avg.rating.toFixed(1)}/5` : "N/A",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-bold text-orange-500">PetMatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button variant="ghost">Iniciar Sesion</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-brand hover:bg-brand-hover">
                Registrate Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <HeroAnimation>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium">
                <PawPrint className="h-4 w-4" />
                La plataforma #1 para mascotas
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Todo lo que tu mascota necesita,{" "}
                <span className="text-orange-500">en un solo lugar</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Paseadores, cuidadores, veterinarias 24/7 y una comunidad de
                amantes de las mascotas. Conecta, reserva y cuida a tu mejor
                amigo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-brand hover:bg-brand-hover text-lg px-8"
                  >
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </div>
          </HeroAnimation>
        </div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl" />
      </section>

      {/* Platform Stats */}
      <ScrollSection>
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {platformStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    <AnimatedCounter value={typeof stat.value === "number" ? stat.value : 0} />
                    {typeof stat.value === "string" && stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <ScrollSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Todo para tu mascota
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                Servicios, comunidad y cuidado en una sola plataforma
              </p>
            </div>
          </ScrollSection>
          <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerCard key={feature.title}>
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="pt-6 space-y-3">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bg}`}
                    >
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </StaggerCard>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Featured Providers */}
      {featuredProviders.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Proveedores Destacados
                </h2>
                <p className="text-muted-foreground mt-3 text-lg">
                  Los mejores profesionales verificados de nuestra plataforma
                </p>
              </div>
            </ScrollSection>
            <StaggerGrid className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredProviders.map((provider) => {
                const initials = provider.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <StaggerCard key={provider.id}>
                    <Card className="text-center h-full">
                      <CardContent className="pt-6 space-y-3">
                        <Avatar className="h-16 w-16 mx-auto">
                          <AvatarImage src={provider.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{provider.displayName}</p>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{provider.averageRating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({provider.totalServices} servicios)
                          </span>
                        </div>
                        {provider.user.city && (
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {provider.user.city}
                          </p>
                        )}
                        <Link href={`/providers/${provider.userId}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Ver perfil
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </StaggerCard>
                );
              })}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <ScrollSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Como funciona</h2>
              <p className="text-muted-foreground mt-3 text-lg">
                En 3 simples pasos
              </p>
            </div>
          </ScrollSection>
          <StaggerGrid className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Registrate",
                description:
                  "Crea tu cuenta gratis y completa tu perfil en minutos.",
              },
              {
                step: "2",
                title: "Agrega tus mascotas",
                description:
                  "Registra a tus mascotas con fotos, raza, temperamento y mas.",
              },
              {
                step: "3",
                title: "Conecta y reserva",
                description:
                  "Busca servicios, encuentra veterinarias o haz match con otras mascotas.",
              },
            ].map((item) => (
              <StaggerCard key={item.step}>
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 text-white text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </StaggerCard>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <ScrollSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Lo que dicen nuestros usuarios
              </h2>
            </div>
          </ScrollSection>
          <StaggerGrid className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <StaggerCard key={testimonial.name}>
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerCard>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <ScrollSection>
        <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
          <div className="container mx-auto px-4 text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Unete a PetMatch hoy
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Miles de mascotas y sus duenos ya estan conectados. Registrate gratis
              y descubre todo lo que podemos hacer por tu mascota.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-orange-500 hover:bg-gray-100 text-lg px-8"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-500">PetMatch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 PetMatch. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
