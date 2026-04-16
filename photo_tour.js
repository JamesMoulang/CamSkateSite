document.addEventListener("DOMContentLoaded", () => {
  const mainPhoto = document.getElementById("main-photo");
  const caption = document.getElementById("caption");
  const thumbnails = document.querySelectorAll(".thumbnail");

  // Set initial caption
  const activeThumbnail = document.querySelector(".active-thumbnail");
  if (activeThumbnail) {
    caption.textContent = activeThumbnail.dataset.caption;
  }

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      // Set the main photo src to the clicked thumbnail's src
      mainPhoto.src = thumbnail.src;

      // Update the caption
      caption.textContent = thumbnail.dataset.caption;

      // Update the active thumbnail
      document
        .querySelector(".active-thumbnail")
        .classList.remove("active-thumbnail");
      thumbnail.classList.add("active-thumbnail");
    });
  });
});
