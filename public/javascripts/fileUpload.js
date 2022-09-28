
//getting the css from the :root style to style the cover image
const rootStyles = window.getComputedStyle(document.documentElement)

//if the property has been loaded 
if (rootStyles.getPropertyValue('--book-cover-large-width') != null && rootStyles.getPropertyValue('--book-cover-large-width') !== '') {
  ready()
} else {
  //if the property has not been loaded yet we just listen and get the main.css to call the ready function
  document.getElementById('main-css').addEventListener('load', ready)
}

//ready function
function ready() {
  const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-large-width'))
  const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'))
  const coverHeight = coverWidth / coverAspectRatio
  
  FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )

  FilePond.setOptions({
    stylePanelAspectRatio: 1 / coverAspectRatio,
    imageResizeTargetWidth: coverWidth,
    imageResizeTargetHeight: coverHeight
  })
  
  FilePond.parse(document.body)
}