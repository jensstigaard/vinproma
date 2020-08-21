// Title Mode settings type
export type TitleModeSettings = {
  enabled: boolean
  sameInputForAllFields: boolean
  fields: {
    currentPosition: TitleModeCurrentPositionField[]
    remaining: TitleModeRemainingField[]
    width: TitleModeWidthField[]
  }
}

type TitleModeField = {
  inputKey: string
  selectedName: string
}

export type TitleModeCurrentPositionField = TitleModeField & { includeRemaining: boolean }

export type TitleModeRemainingField = TitleModeField

export type TitleModeWidthField = TitleModeField & { totalWidth: number }
