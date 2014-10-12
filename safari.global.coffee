commandWasIssued = (event) ->
  console.info "commandWasIssued", event
  if event.command is "minipostWasLaunched"
    console.info "minipostWasLaunched"
    console.info "activeTab.url", event.target.browserWindow.activeTab.url
    if event.target.browserWindow.activeTab.url
      if event.target.browserWindow.activeTab.url.toString().match("minipost/write")
        event.target.browserWindow.activeTab.url = location.toString().replace("safari.global", "minipost/unlock")
      else
        event.target.browserWindow.activeTab.url = location.toString().replace("safari.global", "minipost/write")
    else
      console.info "No active tab"
      event.target.browserWindow.activeTab.url = location.toString().replace("safari.global", "minipost/write")
    return

safari.application.addEventListener "command", commandWasIssued, false
