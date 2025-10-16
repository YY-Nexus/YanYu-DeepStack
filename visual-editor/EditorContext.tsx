import React, { createContext, useContext, useState } from "react"

export type Theme = "light" | "dark"
export interface TeamInfo {
  name: string
  members: string[]
}

interface EditorContextProps {
  theme: Theme
  setTheme: (t: Theme) => void
  team: TeamInfo
  setTeam: (t: TeamInfo) => void
}

const EditorContext = createContext<EditorContextProps | null>(null)

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light")
  const [team, setTeam] = useState<TeamInfo>({ name: "默认团队", members: ["你"] })

  return (
    <EditorContext.Provider value={{ theme, setTheme, team, setTeam }}>
      {children}
    </EditorContext.Provider>
  )
}

export const useEditorContext = () => {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider")
  return ctx
}
