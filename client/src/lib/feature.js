import moment from "moment";

const fileFormat = (url = "") => {
  // Extract the filename from the URL
  const filename = url.split('/').pop();
  
  // Extract the file extension
  const fileExt = filename.split('.').pop().toLowerCase();

  // Check for video formats
  if (["mp4", "webm", "ogg", "mov", "avi"].includes(fileExt)) {
    return "video";
  }
  
  // Check for audio formats
  if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(fileExt)) {
    return "audio";
  }
  
  // Check for image formats
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(fileExt)) {
    return "image";
  }
  
  // Check for PDF format - explicitly recognize PDFs
  if (fileExt === "pdf") {
    return "pdf";
  }
  
  // Check for document formats
  if (["doc", "docx", "txt", "rtf"].includes(fileExt)) {
    return "document";
  }
  
  // Check for spreadsheet formats
  if (["xls", "xlsx", "csv"].includes(fileExt)) {
    return "spreadsheet";
  }
  
  // Check for presentation formats
  if (["ppt", "pptx"].includes(fileExt)) {
    return "presentation";
  }
  
  // Default to generic file type
  return "file";
};

// https://res.cloudinary.com/dj5q966nb/image/upload/dpr_auto/w_200/v1710344436/fafceddc-2845-4ae7-a25a-632f01922b4d.png

// /dpr_auto/w_200
const transformImage = (url = "", width = 100) => {
  const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);

  return newUrl;
};

const getLast7Days = () => {
  const currentDate = moment();

  const last7Days = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = currentDate.clone().subtract(i, "days");
    const dayName = dayDate.format("dddd");

    last7Days.unshift(dayName);
  }

  return last7Days;
};

const getOrSaveFromStorage = ({ key, value, get }) => {
  if (get)
    return localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : null;
  else localStorage.setItem(key, JSON.stringify(value));
};

export { fileFormat, transformImage, getLast7Days, getOrSaveFromStorage };