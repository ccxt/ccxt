#!/usr/bin/env bash

function usage() {
    echo "usage:"
    echo "	-c      Number of lines to trim off the top and bottom of output"
    echo "	-l      View in less editor"
    echo "	-s      Remove special characters"
    echo "	-h      Display help"
    echo "	-a      exchange method and method arguments"
}

if [[ $# < 1 ]]; then
  usage
  exit 1
fi


cliFolder='./examples'

jsCli="${cliFolder}/js/cli.js"
pythonCli="${cliFolder}/py/cli.py"
phpCli="${cliFolder}/php/cli.php"

function display () {
    # Displays output in a less window or just to stdout
    if [ -z ${use_less+x} ]; then
        echo "$1"
    else
        echo "$1" | less -S -R
    fi
}

function removeSpecial () {
    # Removes special characters
    if [ -z ${removeSpecial+x} ]; then # if removeSpecial is unset
        echo "$1"
    else
        echo "$1" | sed -e 's/\[[0-9]\{1,2\}m//g'
    fi
}

function condense () {
    # Trims output down to a set number of lines on the top and the bottom
    if [ -z ${num_lines+x} ]; then
        echo "$1"
    else
        echo "$1" | awk 'NF' | awk -v head=${num_lines} -v tail=${num_lines} 'FNR<=head
            {lines[FNR]=$0}
            END{
                print "..."
                for (i=FNR-tail+1; i<=FNR; i++) print lines[i]
            }'
    fi
}

function removeAndColorLines() {
  local color=$2
  sed -E -e '/.*(iteration|Array|^202.*|^$)/d' -e "s/(.*)/$(tput setaf $color)\1$(tput sgr0)/"
}

color=2
function writeOutput() {
  local interpretter="$1"
  local path="$2"
  local args="$3"
  local rawOutput=$($interpretter "$path" $args)
  local noSpecial=$(removeSpecial "$rawOutput")
  condense "$noSpecial" | removeAndColorLines "$condensed" $color
  ((color++))
  return $color
}

# Loop through command line arguments
while getopts 'hc:sla:' flag; do
    case "${flag}" in
        h) usage ;;
        c) num_lines="${OPTARG}" ;;
        s) removeSpecial=True ;;
        l) use_less=True ;;
        a) args="${OPTARG}" ;;
        *) usage ;;
    esac
done

jsOutput=$(writeOutput node $jsCli "$args")
color=$?

pythonOutput=$(writeOutput python3 $pythonCli "$args")
color=$?

phpOutput=$(writeOutput php $phpCli "$args")
color=$?


output=$(paste <(echo "$jsOutput") <(echo "$phpOutput") <(echo "$pythonOutput") | column -s $'\t' -t)
display "$output"

exit 0
