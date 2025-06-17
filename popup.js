function getUrlKey(url, pattern, pathLevel = 1) {
  switch (pattern) {
    case "exact":
      return url.host + url.pathname + url.search + url.hash
    case "path":
      let pathParts = url.pathname.split("/").filter((part) => part !== "")
      let limitedPath = pathParts.slice(0, pathLevel).join("/")
      return url.host + "/" + limitedPath
    case "domain":
      return url.host
    default:
      return url.host + url.pathname
  }
}

function setUrl() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    url = new URL(tabs[0].url)
    // Show the full URL path instead of just the host
    document.getElementById("url").innerHTML = url.host + url.pathname
    document.getElementById("favicon").style.backgroundImage =
      "url(" + tabs[0].favIconUrl + ")"
  })
}

function loadData() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    url = new URL(tabs[0].url)

    // Load global settings first
    chrome.storage.sync.get(["globalSettings"], function (globalResult) {
      let globalSettings = globalResult.globalSettings || {
        activated: false,
        width: 1200,
        method: "automatic",
      }

      // Check for URL-specific settings with different patterns
      let exactKey = getUrlKey(url, "exact")
      let pathLevel1Key = getUrlKey(url, "path", 1)
      let pathLevel2Key = getUrlKey(url, "path", 2)
      let domainKey = getUrlKey(url, "domain")

      chrome.storage.sync.get(
        [exactKey, pathLevel1Key, pathLevel2Key, domainKey],
        function (urlResult) {
          let urlSettings = {}
          let matchedPattern = "path"
          let matchedPathLevel = 1

          // Check in order of specificity: exact -> path level 2 -> path level 1 -> domain
          if (urlResult[exactKey]) {
            urlSettings = urlResult[exactKey]
            matchedPattern = "exact"
          } else if (urlResult[pathLevel2Key]) {
            urlSettings = urlResult[pathLevel2Key]
            matchedPattern = "path"
            matchedPathLevel = 2
          } else if (urlResult[pathLevel1Key]) {
            urlSettings = urlResult[pathLevel1Key]
            matchedPattern = "path"
            matchedPathLevel = 1
          } else if (urlResult[domainKey]) {
            urlSettings = urlResult[domainKey]
            matchedPattern = "domain"
          }

          // Apply global settings as defaults, override with URL-specific if they exist
          document.getElementById("option-activate-wb").checked =
            globalSettings.activated
          document.getElementById("option-width-setting").value =
            urlSettings.width || globalSettings.width
          setSelectedMethod(urlSettings.method || globalSettings.method)

          // Load the disabled sites setting and pattern
          document.getElementById("option-disable-site").checked =
            urlSettings.disabled || false
          document.getElementById("option-pattern").value =
            urlSettings.pattern || matchedPattern
          document.getElementById("option-path-level").value =
            urlSettings.pathLevel || matchedPathLevel

          setOverlay()
          updatePatternVisibility()
        }
      )
    })
  })
}

function writeData() {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    url = new URL(tabs[0].url)

    // Save global settings
    let globalSettings = {
      activated: document.getElementById("option-activate-wb").checked,
      width: Number(document.getElementById("option-width-setting").value),
      method: getSelectedMethod(),
    }
    chrome.storage.sync.set({ globalSettings: globalSettings })

    // Handle URL-specific settings
    let isDisabled = document.getElementById("option-disable-site").checked
    let pattern = document.getElementById("option-pattern").value
    let pathLevel = Number(document.getElementById("option-path-level").value)
    let currentWidth = Number(
      document.getElementById("option-width-setting").value
    )
    let currentMethod = getSelectedMethod()

    if (
      isDisabled ||
      currentWidth !== globalSettings.width ||
      currentMethod !== globalSettings.method
    ) {
      // Save URL-specific settings using the selected pattern and path level
      let urlKey = getUrlKey(url, pattern, pathLevel)
      let urlSettings = {}
      urlSettings[urlKey] = {
        width: currentWidth,
        method: currentMethod,
        disabled: isDisabled,
        pattern: pattern,
        pathLevel: pathLevel,
      }
      chrome.storage.sync.set(urlSettings)

      // Clean up other pattern keys to avoid conflicts
      let keysToRemove = []
      if (pattern !== "exact") keysToRemove.push(getUrlKey(url, "exact"))
      if (pattern !== "path" || pathLevel !== 1)
        keysToRemove.push(getUrlKey(url, "path", 1))
      if (pattern !== "path" || pathLevel !== 2)
        keysToRemove.push(getUrlKey(url, "path", 2))
      if (pattern !== "domain") keysToRemove.push(getUrlKey(url, "domain"))

      if (keysToRemove.length > 0) {
        chrome.storage.sync.remove(keysToRemove)
      }
    } else {
      // Remove all URL-specific settings if they match global
      let keysToRemove = [
        getUrlKey(url, "exact"),
        getUrlKey(url, "path", 1),
        getUrlKey(url, "path", 2),
        getUrlKey(url, "domain"),
      ]
      chrome.storage.sync.remove(keysToRemove)
    }
  })
}

function getSelectedMethod() {
  var radios = document.getElementsByName("option-method")

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      return radios[i].value
    }
  }
}

function setSelectedMethod(value) {
  var radios = document.getElementsByName("option-method")

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].value == value) {
      radios[i].checked = true
      break
    }
  }
}

function changeWidthSetting(diff) {
  let currval = Number(document.getElementById("option-width-setting").value)
  if (currval + diff >= 100) {
    document.getElementById("option-width-setting").value = currval + diff
  } else {
    document.getElementById("option-width-setting").value = 100
  }
}

function setOverlay() {
  let wbActivated = document.getElementById("option-activate-wb").checked
  let siteDisabled = document.getElementById("option-disable-site").checked

  if (wbActivated && !siteDisabled) {
    document.getElementById("options-wrapper-overlay").style.display = "none"
  } else {
    document.getElementById("options-wrapper-overlay").style.display = "initial"
  }
}

function updatePatternVisibility() {
  let isDisabled = document.getElementById("option-disable-site").checked
  let pattern = document.getElementById("option-pattern").value

  let patternDiv = document.getElementById("pattern-selection")
  let pathLevelDiv = document.getElementById("path-level-selection")

  if (isDisabled) {
    patternDiv.style.display = "block"
    // Only show path level selection when "Path only" is selected
    if (pattern === "path") {
      pathLevelDiv.style.display = "block"
    } else {
      pathLevelDiv.style.display = "none"
    }
  } else {
    patternDiv.style.display = "none"
    pathLevelDiv.style.display = "none"
  }
}

function updatePage() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "update" },
      function (response) {
        var lastError = chrome.runtime.lastError
        if (lastError) {
          // if message can not be sent, reload (happens directly after installation)
          chrome.tabs.reload()
          return
        }
      }
    )
  })
}

function update() {
  changeWidthSetting(0)
  writeData()
  updatePage()
  setOverlay()
  updatePatternVisibility()
}

document.addEventListener("DOMContentLoaded", function () {
  setUrl()
  loadData()

  document
    .getElementsByTagName("body")[0]
    .addEventListener("change", function () {
      update()
    })

  document
    .getElementById("option-decrease-width")
    .addEventListener("click", function () {
      changeWidthSetting(-100)
      update()
    })

  document
    .getElementById("option-increase-width")
    .addEventListener("click", function () {
      changeWidthSetting(100)
      update()
    })

  // Add event listener for pattern dropdown to show/hide path level
  document
    .getElementById("option-pattern")
    .addEventListener("change", function () {
      updatePatternVisibility()
    })
})
