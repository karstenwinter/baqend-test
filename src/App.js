import React from "react"
import clsx from "clsx"
import { makeStyles, useTheme } from "@material-ui/core/styles"
import { FixedSizeList } from "react-window"
import MenuIcon from "@material-ui/icons/Menu"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import SettingsIcon from '@material-ui/icons/Settings'
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import InboxIcon from "@material-ui/icons/MoveToInbox"
import MailIcon from "@material-ui/icons/Mail"
import {
  createMuiTheme,
  Paper,
  CssBaseline,
  List,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  ThemeProvider,
  useMediaQuery,
  Accordion,
  Divider,
  Toolbar,
  AppBar,
  AccordionSummary,
  AccordionDetails,
  ListItem,
  ListItemIcon,
  CircularProgress,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  Button,
} from "@material-ui/core"

const getSets = () =>
  fetch("https://api.scryfall.com/sets")
    .then((x) => x.json())
    .then((x) => x?.data)

const getSet = (code: string) =>
  fetch("https://api.scryfall.com/sets/" + code).then((x) => x.json())

const getCards = (setCode: string) =>
  fetch("https://api.scryfall.com/cards/search?order=cmc&q=e%3A" + setCode)
    .then((x) => x.json())
    .then((x) => x?.data)

const getBulk = () =>
  fetch("https://api.scryfall.com/bulk").then((x) => x.json())

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuButton2: {
    marginLeft: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  drawerHeader2: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-start",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}))

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  )

  const [cards, setCards] = React.useState([])
  const [sets, setSets] = React.useState([])
  const [set, setSet] = React.useState(null)

  const [apiToken, setApiToken] = React.useState(
    () =>
      localStorage.getItem("cardSpoilerApiToken") ??
      "7f......................................................................52",
    []
  )
  const [baqendResult, setBaqendResult] = React.useState(null)
  const [adminOpen, setAdminOpen] = React.useState(false)
  const [setsOpen, setSetsOpen] = React.useState(false)

  const handleError = (url) => (error) => {
    setBaqendResult({ op: "revalidate", url, error })
    throw error
  }
  function refreshCaches() {
    var rev = "https://karsten.app.baqend.com/v1/asset/revalidate"
    setBaqendResult({ op: "revalidate", url: rev, status: "posting" })

    localStorage.setItem("cardSpoilerApiToken", apiToken)
    fetch(rev, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "BAT " + apiToken,
      },
      body: JSON.stringify({
        filter: {
          prefixes: ["https://api.scryfall.com"],
        },
        type: "REFRESH",
      }),
    })
      .then((x) => x.json())
      .then((x) => {
        setBaqendResult({ op: "revalidate", url: rev, result: x })
        var revStatus = rev + "/2da2a2c6-0f7c-4a24-9662-72d7685a8295"
        fetch(revStatus, { headers: { Authorization: "BAT " + apiToken } })
          .then((x) => x.json())
          .then((x) =>
            setBaqendResult({
              op: "revalidate-status",
              url: revStatus,
              result: x,
            })
          )
          .catch(handleError(revStatus))
        return x
      })
      .catch(handleError(rev))
  }

  React.useEffect(() => {
    getSets().then((list) => {
      if (list) {
        setSets(list)
        setSetsOpen(true)
      }
    })
  }, [])

  const classes = useStyles()

  const handleDrawerOpen = () => {
    
  }

  const handleDrawerClose = () => {
    setSetsOpen(false)
  }

  const renderRow = ({ index, style }) => {
    var set = sets[index]

    return (
      <ListItem
        button
        style={style}
        onClick={() => {
          setSet(null)
          setCards([])
          getSet(set.code).then((x) => setSet(x))
          getCards(set.code).then((x) => setCards(x))
        }}
        key={set.code}
      >
        <ListItemIcon>
          <img src={set.icon_svg_uri} width="32" />
        </ListItemIcon>
        <ListItemText primary={set.name} secondary={set.released_at} />
      </ListItem>
    )
  }
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: setsOpen,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setSetsOpen(true)}
              edge="start"
              className={clsx(classes.menuButton, setsOpen && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Magic Card browser:{" "}
              {sets.length == 0 ? "" : sets.length + " sets"}
            </Typography>

            <IconButton
              color="inherit"
              aria-label="open admin drawer"
              onClick={() => setAdminOpen(true)}
              edge="end"
              className={clsx(classes.menuButton2, adminOpen && classes.hide)}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={setsOpen}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </div>
          <Divider />

          {sets.length == 0 ? (
            <CircularProgress />
          ) : (
            <FixedSizeList
              height={1000}
              itemSize={100}
              itemCount={sets.length}
            >
              {renderRow}
            </FixedSizeList>
          )}
        </Drawer>

        <Drawer variant="persistent" anchor="right" open={adminOpen}>
          <div style={{padding: 14}}>

              <div className={classes.drawerHeader2}>
                <IconButton onClick={() => setAdminOpen(false)}>
                  {theme.direction === "ltr" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </div>
              <Divider />

            <h3>ADMIN stuff</h3>

            <div>
              <TextField
                fullWidth
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={refreshCaches}>Refresh</Button>
            </div>
            {baqendResult == null ? (
              ""
            ) : (
              <pre>{JSON.stringify(baqendResult, null, " ")}</pre>
            )}
          </div>
        </Drawer>

        <main
          className={clsx(classes.content, {
            [classes.contentShift]: setsOpen,
          })}
        >
          <div className={classes.drawerHeader} />
          <Typography paragraph>
          {sets.length == 0 ? 
            <CircularProgress />
            : ""}

            {set == null ? (
              ""
            ) : (
              <div>
                <div>
                  <Typography variant="h4">
                    <img src={set.icon_svg_uri} width="32" /> {set.name} ({set.code}){cards.length == 0 ? "" : ", cards: " + cards.length}
                  </Typography>
                  {/*<Button
                    onClick={() => {
                      setSet(null)
                      setCards([])
                      setSetsOpen(true)
                    }}
                  >
                    Close
                  </Button>
                */}
                </div>
                {/*<pre>{JSON.stringify(set, null, " ")}</pre>*/}

                {cards.length == 0 ? (
                  <CircularProgress />
                ) : (
                  <div>
                    {/*{cards.map(card => <pre>{JSON.stringify(card, null, " ")}</pre>)}*/}
                    {cards.map((card) => (
                      <span>
                        <img
                          src={card.image_uris?.png || card.image_uris?.small}
                          alt={card.name}
                          width="320"
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Typography>
        </main>
      </div>
    </ThemeProvider>
  )
}
