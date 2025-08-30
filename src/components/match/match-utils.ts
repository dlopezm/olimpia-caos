export const resultToTitle = (result: string) => {
  switch (result) {
    case "white":
      return "Victòria ◻️";
    case "dark":
      return "Victòria ◼️";
    case "draw":
      return "Empat";
    default:
      return "";
  }
};

export const resultToDescription = (result: string) => {
  switch (result) {
    case "white":
      return "L'equip blanc (local) va guanyar aquest partit";
    case "dark":
      return "L'equip negre (visitant) va guanyar aquest partit";
    case "draw":
      return "Aquest partit va acabar en empat";
    default:
      return "";
  }
};
