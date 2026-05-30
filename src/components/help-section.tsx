"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useFinanceStore } from "@/store/finance-store"
import {
  HelpCircle,
  LayoutDashboard,
  Wallet,
  Receipt,
  PiggyBank,
  Heart,
  Target,
  Settings,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  Plus,
  DollarSign,
  BarChart3,
  ListChecks,
  Bookmark,
  Shield,
  CloudOff,
  Sparkles,
} from "lucide-react"

const sections = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    color: "text-[#14B8A6]",
    bg: "bg-[#14B8A6]/10",
    description: "Your financial overview at a glance. See your available balance, income vs expenses chart, top spending categories, active projects, and wishlist summary — all in one place.",
    tips: [
      "The balance card shows your monthly income minus this month's expenses",
      "The chart compares your income and expenses over the last 6 months",
      "Quick action buttons let you jump to any section instantly",
    ],
  },
  {
    icon: Wallet,
    title: "Income",
    color: "text-[#14B8A6]",
    bg: "bg-[#14B8A6]/10",
    description: "Track all your income sources — salary, freelance work, dividends, or any other earnings. Each source can have a different frequency (weekly, monthly, yearly, or one-time) and the app automatically calculates your total monthly income.",
    tips: [
      'Click the "+" button to add a new income source',
      "Toggle an income source off if it's no longer active — it won't count toward your total",
      "Set a next pay date to remind yourself when the next payment arrives",
      "Edit any source by clicking the three-dot menu on its card",
    ],
  },
  {
    icon: Receipt,
    title: "Expenses",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    description: "Log and categorize every expense. Choose from 9 categories (Housing, Food, Transport, Shopping, Entertainment, Health, Education, Bills, Other) and track payment methods, recurring expenses, and notes for each entry.",
    tips: [
      "Expenses are grouped by date — Today, Yesterday, This Week, and Earlier",
      "Mark recurring expenses to easily identify subscriptions and regular bills",
      "Use the duplicate button to quickly re-add a similar expense",
      "Filter by category to see where your money goes each month",
    ],
  },
  {
    icon: PiggyBank,
    title: "Savings & Budget",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    description: "Monitor your savings rate and set monthly budget limits for each expense category. The app shows how much money is left this month and warns you when spending approaches or exceeds your budget limits.",
    tips: [
      "A savings rate of 20% or more is considered healthy — aim for green!",
      "Set a budget for each category to get a visual progress bar",
      "Budget bars turn amber at 80% and red when over limit",
      "Your savings rate is calculated as (Income - Expenses) / Income",
    ],
  },
  {
    icon: Heart,
    title: "Wishlist",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-100 dark:bg-pink-900/30",
    description: "Keep a list of things you want to buy. Add items with prices, links, and images. Prioritize them as low, medium, or high, and mark items as purchased once you buy them. The dashboard shows your total wishlist cost.",
    tips: [
      "Add a link so you can quickly jump to the product page",
      "Set priority to help you decide what to buy first",
      "Mark items as purchased to track what you've already bought",
      "The dashboard tells you if you can afford your entire wishlist",
    ],
  },
  {
    icon: Target,
    title: "Projects",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
    description: "Plan and track any project that involves expenses — home renovation, travel planning, event organization, or savings goals. Add individual items with costs, check them off as you go, and see your progress in real time.",
    tips: [
      "Each project has its own checklist of items with individual costs",
      "Track progress with the visual completion percentage bar",
      "Set a due date and priority to stay organized",
      "Use categories (Home, Travel, Tech, Education, Health, Savings) to group projects",
      "Mark an entire project as complete when all items are done",
    ],
  },
  {
    icon: Settings,
    title: "Settings",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800/30",
    description: "Customize Axtora to fit your needs. Change your currency (35+ supported), toggle number formatting, switch between light and dark themes, choose your start page, and manage your data with backup and restore.",
    tips: [
      "Export a backup JSON file regularly to keep your data safe",
      "Import a backup file to restore data on a new device or browser",
      "Choose your preferred currency — amounts display with the right symbol and format",
      "Use compact numbers to see $5.2K instead of $5,200 for large amounts",
    ],
  },
]

const faqs = [
  {
    q: "Where is my data stored?",
    a: "All your data is stored locally in your browser's localStorage. Nothing is sent to any server. This means your data stays private, but also means it's tied to this browser — use the Export Backup feature in Settings to save your data.",
  },
  {
    q: "Does the app work offline?",
    a: "Yes! Axtora works completely offline after the first load. You can add, edit, and delete data without an internet connection. The service worker caches the app so it loads even when you're offline.",
  },
  {
    q: "How do I move my data to another device?",
    a: "Go to Settings, click 'Export Backup' to download a JSON file. On the new device, open Axtora, go to Settings, and click 'Import Restore' to upload that file. All your data will be transferred.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "Clearing browser data will erase your Axtora data. Always keep a recent backup by using the Export Backup feature. You can restore from that backup anytime.",
  },
  {
    q: "Is my data secure?",
    a: "Your data never leaves your browser. There are no accounts, no servers, and no tracking. Everything stays on your device.",
  },
]

export function HelpSection() {
  const setActiveSection = useFinanceStore((s) => s.setActiveSection)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <HelpCircle className="h-7 w-7 text-[#14B8A6]" />
          Help Guide
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5 font-semibold">
          Learn how to get the most out of Axtora
        </p>
      </div>

      {/* Getting Started Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-[#14B8A6]/20 bg-gradient-to-br from-[#14B8A6]/5 to-transparent">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#14B8A6]" />
              </div>
              <h2 className="text-base font-extrabold">Getting Started</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Axtora is your personal finance and life management tool. Here&apos;s how to start:
            </p>
            <div className="space-y-2.5">
              {[
                { step: "1", text: "Add your income sources", icon: Wallet, action: "income" as const },
                { step: "2", text: "Start logging expenses", icon: Receipt, action: "expenses" as const },
                { step: "3", text: "Set budget limits for categories", icon: PiggyBank, action: "savings" as const },
                { step: "4", text: "Track projects and wishlists", icon: Target, action: "projects" as const },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.step}
                    onClick={() => setActiveSection(item.action)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-background/60 hover:bg-background border border-border/50 transition-colors text-left"
                  >
                    <span className="h-6 w-6 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] text-xs font-extrabold flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-bold flex-1">{item.text}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Guides */}
      {sections.map((section, index) => {
        const Icon = section.icon
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg ${section.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  <h2 className="text-base font-extrabold">{section.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
                <div className="space-y-1.5">
                  {section.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-2">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#14B8A6]" />
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { icon: DollarSign, label: "35+ currencies supported" },
                { icon: CloudOff, label: "Works completely offline" },
                { icon: Shield, label: "Data stays in your browser" },
                { icon: Bookmark, label: "Export & import backups" },
                { icon: ListChecks, label: "Project checklists with costs" },
                { icon: Plus, label: "Recurring expense tracking" },
              ].map((feature) => {
                const FeatureIcon = feature.icon
                return (
                  <div key={feature.label} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30">
                    <FeatureIcon className="h-3.5 w-3.5 text-[#14B8A6] shrink-0" />
                    <span className="text-xs font-bold">{feature.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#14B8A6]" />
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-1.5">
                <p className="text-sm font-bold">{faq.q}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                {index < faqs.length - 1 && <div className="border-t border-border/50 pt-3" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-[#14B8A6]/20">
          <CardContent className="p-4 space-y-3">
            <h2 className="text-base font-extrabold">Ready to start?</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setActiveSection("income")}
                className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white font-bold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add your first income
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveSection("expenses")}
                className="font-bold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Log an expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
