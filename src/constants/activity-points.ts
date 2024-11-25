export interface ActivityPoints {
  feeding: number
  diaper: number
  sleep: number
  earlyBirdBonus: number
  nightOwlBonus: number
  rainyDayBonus: number
  sunnyDayBonus: number
  snowDayBonus: number
  severeWeatherBonus: number
  photoAttachment: number
  highQualityPhoto: number
}

export const ACTIVITY_POINTS: ActivityPoints = {
  feeding: 20,
  diaper: 15,
  sleep: 25,
  earlyBirdBonus: 50,
  nightOwlBonus: 30,
  rainyDayBonus: 20,
  sunnyDayBonus: 10,
  snowDayBonus: 30,
  severeWeatherBonus: 40,
  photoAttachment: 15,
  highQualityPhoto: 10
} 