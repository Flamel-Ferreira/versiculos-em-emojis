import { ArrowRight, Gamepad2, Sparkles, UserRoundPlus } from 'lucide-react'
import { PageContainer } from '../components/layout/PageContainer'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function HomePage() {
  return (
    <PageContainer className="flex justify-center py-10 sm:py-14">
      <div className="w-full max-w-[760px] space-y-6">
        <Card className="relative overflow-hidden px-5 py-9 text-center sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary-soft/70" />
          <div className="pointer-events-none absolute -bottom-8 -right-6 h-28 w-28 rounded-full bg-accent-soft/70" />

          <div className="relative flex flex-col items-center gap-5">
            <Badge tone="primary" icon={<span aria-hidden="true">📌</span>}>
              Diversão Bíblica Infantil
            </Badge>

            <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full bg-primary-soft shadow-[inset_0_0_0_10px_rgba(255,255,255,0.5)] sm:h-[190px] sm:w-[190px]">
              <img
                src="/assets/logo.png"
                alt="Mascote do Versículos em Emojis"
                className="animate-float h-[150px] w-[150px] object-contain sm:h-[168px] sm:w-[168px]"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-balance text-4xl font-black tracking-tight text-ink sm:text-5xl">
                Versículos em Emojis
              </h1>
              <p className="text-lg font-bold text-ink-soft sm:text-xl">
                Aprenda a Palavra de Deus brincando! ✨ 📖
              </p>
            </div>

            <div className="flex w-full items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xl" aria-hidden="true">
                ☀️
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="w-full space-y-4">
              <div>
                <Button
                  to="/cadastrar"
                  variant="primary"
                  size="lg"
                  fullWidth
                  iconLeft={<UserRoundPlus className="h-5 w-5" />}
                  iconRight={<ArrowRight className="h-5 w-5" />}
                >
                  <div className='flex flex-col'>
                    <p className='text-yellow-800'>Cadastrar Versículo</p>
                    <p className="text-yellow-800 text-sm font-normal">
                      Criar novos enigmas e lições
                    </p>
                  </div>
                </Button>
              </div>

              <div>
                <Button
                  to="/versiculos"
                  variant="accent"
                  size="lg"
                  fullWidth
                  iconLeft={<Gamepad2 className="h-5 w-5" />}
                  iconRight={<ArrowRight className="h-5 w-5" />}
                >
                  <div className='flex flex-col'>
                    <p className='text-white'>Selecionar Versículo</p>
                    <p className="text-sm font-semibold">
                      Escolher um jogo para decifrar!
                    </p>
                  </div>
                </Button>
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs font-bold text-muted">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Memorize a Bíblia com cores e emojis
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
