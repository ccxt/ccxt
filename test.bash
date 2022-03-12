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

function help() {
    echo "usage:"
    echo "	-c      Number of lines to trim off the top and bottom of output"
    echo "	-l      View in less editor"
    echo "	-s      Remove special characters"
    echo "	-h      Display help"
    echo "	-a      exchange method"
}

# Loop through command line arguments
while getopts 'hc:sla:' flag; do
    case "${flag}" in
        h) help ;;
        c) num_lines="${OPTARG}" ;;
        s) removeSpecial=True ;;
        l) use_less=True ;;
        a) args="${OPTARG}" ;;
        *) help ;;
    esac
done

jsOutput=$(node $jsCli ${args})
noSpecialJs=$(removeSpecial "$jsOutput")
jsOutput=$(condense "$noSpecialJs")

pythonOutput=$(python3 $pythonCli ${args})
noSpecialPython=$(removeSpecial "$pythonOutput")
pythonOutput=$(condense "$noSpecialPython")

phpOutput=$(php $phpCli ${args})
noSpecialPhp=$(removeSpecial "$phpOutput")
phpOutput=$(condense "$phpOutput")

output=$(paste <(echo "$jsOutput") <(echo "$phpOutput") <(echo "$pythonOutput") | column -s $'\t' -t)
display "$output"

exit 0
