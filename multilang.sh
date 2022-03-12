#!/usr/bin/env bash

function usage() {
  echo "usage: $0 [-clsh] exchange method [...args]"
  echo "	-c      Number of lines to trim off the top and bottom of output"
  echo "	-l      View in less editor"
  echo "	-s      Remove special characters"
  echo "	-h      Display help"
  exit 1
}

if [[ $# < 1 ]]; then
  usage
fi

cliFolder='./examples'

jsCli="${cliFolder}/js/cli.js"
pythonCli="${cliFolder}/py/cli.py"
phpCli="${cliFolder}/php/cli.php"

useLess=false
removeSpecial=false
numLines=0

function display() {
  # Displays output in a less window or just to stdout
  if ${useLess}; then
    less -S -R
  else
    tee
  fi
}

function removeSpecial {
  # Removes special characters
  if ${removeSpecial}; then
    sed -e 's/\[[0-9]\{1,2\}m//g'
  else
    tee
  fi
}

function condense {
  # Trims output down to a set number of lines on the top and the bottom
  local pythonLength=$1
  local half=$(($numLines / 2))
  local continueFrom=$((pythonLength - half))
  if [ ${numLines} -gt 0 ]; then
    sed -n "1,${half}p;${continueFrom},${pythonLength}p"
  else
    tee
  fi
}

function removeAndColorLines {
  sed -E -e '/.*(iteration|Array|^202.*|^$)/d' -e 's/  / /g' -e 's/  / /g' -e "s/(.*)/$(tput setaf $color)\1$(tput sgr0)/"
}

function writeOutput {
  local interpretter="$1"
  local path="$2"
  local args="$3"
  $interpretter "$path" $args | removeSpecial | removeAndColorLines $color
}

function padOutput {
  local input="$1"
  local length="$2"
  echo "$input"
  for ((i=$(wc -l <<< "$input"); i < $length; i++)); do
    echo "$(tput setaf 1)$(tput sgr0)"
  done
}

# Loop through command line arguments
while getopts 'hc:sl' flag; do
  case "${flag}" in
  h) usage ;;
  c) numLines="${OPTARG}" ;;
  s) removeSpecial=true ;;
  l) useLess=true ;;
  *) usage ;;
  esac
done

shift $((OPTIND - 1))

args="$@"
jsArgs=$(echo "$args" | sed -E -e 's/(null|None)/undefined/g')
pythonArgs=$(echo "$args" | sed -E -e 's/(undefined|null)/None/g')
phpArgs=$(echo "$args" | sed -E -e 's/(undefined|None)/null/g')

color=3
jsOutput=$(writeOutput node $jsCli "--no-table $jsArgs")
((color++))

pythonOutput=$(writeOutput python3 $pythonCli "$pythonArgs")
pythonLength=$(wc -l <<< "$pythonOutput")
((color++))

phpOutput=$(writeOutput php $phpCli "$phpArgs")

# use padding here
length=$(wc -l <<< "$phpOutput")
jsOutput=$(padOutput "$jsOutput" $length)
pythonOutput=$(padOutput "$pythonOutput" $length)

paste <(echo "$jsOutput") <(echo "$phpOutput") <(echo "$pythonOutput") | column -s $'\t' -t | condense $pythonLength | display
