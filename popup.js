chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currTab = tabs[0];
    document.getElementById("tryAgain").addEventListener("click", tryAgain);
    document.getElementById("tipButton").addEventListener("click", tips);
    document.getElementById("dirButton").addEventListener("click", directions);

    url = tabs[0].url
    firstquery(currTab.title, url)
    //use the site url as a second attempt to query for NPO (more development
    // x=url.split(".")
    // if x.length=2
    // then x.split("/")
    // take the second element from array and run search on that value

});

function firstquery(title, url) {
    document.getElementById("search").style.display = "block"
    console.log(url)
    var resps = []
    // parsing title for later query 
    title = title.replace("Donate to ", "")
    title = title.replace("Donate ", "")
    title = title.replace("Official Site", "")
    val = title.split(" | ")
    if (!title.includes(" | ")) {
        if (title.includes(" ‒ ")) {
            val = title.split(" ‒ ")
        }
        else if (title.includes(" – ")) {
            val = title.split(" – ")
        }
        else if (title.includes(" - ")) {
            val = title.split(" - ")
        }
        else if (title.includes(" — ")) {
            val = title.split(" — ")
        }
        else if (title.includes(" ― ")) {
            val = title.split(" ― ")
        }
        else if (title.includes(" ⁓ ")) {
            val = title.split(" ⁓ ")
        }
    }
    errorCount = 0
    // In document.title, it is common to have the name of the NPO and also some other information. 
    // This formatting will be random and so we have to figure out if the organization name is on the left or right of the " | "
    // symbol that is consistently found in document.title
    for (i = 0; i < val.length; i++) {
        if (val[i].includes(" - ") && title.includes("|")) {
            // remove any information after a dash. is almost always irrelevant and will mess up search
            val[i] = val[i].split("-")[0]
        }
        else if (val[i].includes(" — ") && title.includes("|")) {
            val[i] = val[i].split("—")[0]
        }
        if (val[i].includes(",")) {
            // remove any information after a comma. 
            val[i] = val[i].split(",")[0]
        }
        if (val[i].includes(":")) {
            // remove any information after a colon. 
            val[i] = val[i].split(":")[0]
        }
        if (val[i].includes(".")) {
            // remove any information after a colon. 
            val[i] = val[i].split(".")[0]
        }
        if (val[i].includes("&")) {
            // url-encode the 'and' symbol
            val[i] = val[i].replace("&", "%26")
        }

        // if val length isn't two, something is wrong with the way the document.title is formatted and
        // the following code won't work. else, run query since it has the possibility to return a result 
        if (val.length == 3) {
            document.getElementById("search").style.display = "none"
            document.getElementById("main").style.display = "none"
            document.getElementById("sorry").style.display = "block"
        } else {
            //create the url-encoding of a search string
            phrase = val[i].replaceAll(" ", "%20")
            bookend = "%22"
            searchString = bookend.concat(phrase)
            searchString = searchString.concat(bookend)
            console.log(searchString)
            // use this searchString to query ProPublica's API for related search results 
            $.ajax({
                url: "https://projects.propublica.org/nonprofits/api/v2/search.json?q=" + searchString,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                success: function (res) {
                    console.log("success")

                },
                error: function (res) {
                    console.log("error with search Strings")
                    errorCount = errorCount + 1
                    if (errorCount == 2 || val.length == 1 || val.length == 3) {
                        document.getElementById("search").style.display = "none"
                        document.getElementById("main").style.display = "none"
                        document.getElementById("sorry").style.display = "block"
                        i = 10
                        return
                    }
                }
            }).then(resp => {
                resps.push(resp)
                //.....................................
                //....val format requires different....
                //..........query operations...........
                //.....................................
                //if two vals
                //if two vals arent 0 in length
                //if val[0]<val[1]
                //else
                //else if val[0]!=0 in length
                //else if val[1]!=0 in length
                //if one val
                //.....................................

                if (resps.length === 1 && errorCount <= 1) { //if one val
                    document.getElementById("response").innerHTML = JSON.stringify(resps)
                    x = JSON.parse(document.getElementById("response").innerHTML)
                    if (x[0].total_results > 0) {
                        console.log(x[0].organizations[0].name)
                        document.getElementById('orgName').innerHTML = x[0].organizations[0].name + ", " + x[0].organizations[0].state
                        findEin(x[0])
                    }
                }

                if (resps.length === 2 && errorCount <= 0) { //if two vals
                    document.getElementById("response").innerHTML = JSON.stringify(resps)
                    x = JSON.parse(document.getElementById("response").innerHTML)
                    if (x[0].total_results > 0 && x[1].total_results > 0) {
                        console.log("x[0].total_results=" + x[0].total_results + " x[1].total_results=" + x[1].total_results)
                        if (x[0].total_results < x[1].total_results) {
                            //log and update html
                            console.log(x[0].organizations[0].name)
                            document.getElementById('orgName').innerHTML = x[0].organizations[0].name + ", " + x[0].organizations[0].state
                            document.getElementById('otherOrgName').innerHTML = JSON.stringify(x[1])
                            console.log(x[1])
                            // retrieve EIN of search result with highest revenue
                            findEin(x[0])
                        } else {
                            console.log(x[1].organizations[0].name)
                            document.getElementById('orgName').innerHTML = x[1].organizations[0].name + ", " + x[1].organizations[0].state
                            document.getElementById('otherOrgName').innerHTML = JSON.stringify(x[0])
                            console.log(x[0])
                            findEin(x[1])
                        }

                    }
                    else if (x[0].total_results > 0) {
                        console.log(x[0].organizations[0].name)
                        document.getElementById('orgName').innerHTML = x[0].organizations[0].name + ", " + x[0].organizations[0].state
                        document.getElementById('otherOrgName').innerHTML = JSON.stringify(x[1])
                        findEin(x[0])
                    }
                    else {
                        console.log(x[1].organizations[0].name)
                        document.getElementById('orgName').innerHTML = x[1].organizations[0].name + ", " + x[1].organizations[0].state
                        document.getElementById('otherOrgName').innerHTML = JSON.stringify(x[0])
                        findEin(x[1])
                    }
                }

            })
        }
    }



}


function findEin(xval) {
    document.getElementById("orgName").innerHTML = xval.organizations[0].name
    console.log("retrieving <20 results for " + xval.organizations[0].name + " and looking at each result's totalrev as well as if it has a filling ")
    //compare every subsequent highestRev and ein to the first search result (that may have the largest highestRev out of the list)
    let highestRev = 0
    let ein = xval.organizations[0].ein
    let promises = [];
    for (i = 0; (i < xval.total_results) && (i < 20); i++) {
        //evaluate which organization in total_results has the highest revenue. use that as the Organization ito evaluate
        promises.push(
            $.ajax({
                url: "https://projects.propublica.org/nonprofits/organizations/" + xval.organizations[i].ein,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
                success: function (resp) {

                },
                error: function (resp) {
                    document.getElementById("sorry").style.display = "block"
                }
            }).then(resp => {
                //creating a DOM element housing our response to then parse the xml response for items we need.
                var dom = document.createElement('html');
                dom.innerHTML = resp
                //IF there are results AND those results have an associated scrape-able xml link,get its totalrev
                if ((dom.getElementsByClassName("single-filing cf").length > 1) && (dom.getElementsByClassName("action xml").length > 0) && (dom.getElementsByClassName("revenue monospace-numbers").length > 0)) {
                    console.log("PASS EVAL")
                    totalRev = dom.getElementsByClassName("revenue monospace-numbers")[0].children[0].children[1].children[1].innerHTML
                    totalRev = totalRev.replaceAll(",", "");
                    totalRev = totalRev.replace("$", "");
                    totalRev = parseInt(totalRev);
                    console.log(totalRev)
                    if (totalRev > highestRev) {
                        highestRev = totalRev;
                        ein = dom.getElementsByClassName("profile-info")[0].children[0].children[0].innerText.split(": ")[1].replace("-", "")
                        console.log("found highest revenue");

                    }
                } else {
                    console.log("DIDNT PASS EVAL");

                }
            }));
    }
    //only after all the promises resolve is when the highest total rev would be found. now can call irsQuery
    Promise.all(promises).then(success => {
        //handleS
        irsQuery(ein);
    }, err => {
        irsQuery(ein);
    })
}

function irsQuery(ein) {
    console.log("IRSEQUERY for ein#:" + ein)
    $.ajax(
        {
            //scrape from PAGE not API 
            url: "https://projects.propublica.org/nonprofits/organizations/" + ein,
            dataType: "html",
            success: function (html) {
                //creating a DOM element housing our response to then parse the xml response for link we need.
                //this link contains the most recent XML version of the 990 filing 
                var dom = document.createElement('html');
                dom.innerHTML = html
                orgName = dom.getElementsByTagName("h1")[2].innerText
                orgLocation = dom.getElementsByClassName("small-label")[0].innerText
                document.getElementById('orgName').innerHTML = orgName + ", " + orgLocation.split(/[0-9]/g)[0]
                if (dom.getElementsByClassName("single-filing cf").length > 1 && dom.getElementsByClassName("action xml").length > 0) {
                    // xmlLink = dom.getElementsByClassName("single-filing cf")[1].children[0].lastElementChild.href
                    if (dom.getElementsByClassName("action xml")[0].childElementCount >= 3){
                        option=dom.getElementsByClassName("action xml")[0].options[1]
                        xmlLink=option.dataset.href
                    }
                    else{
                        xmlLink = dom.getElementsByClassName("action xml")[0].href
                    }
                    RAWpdfLink = dom.getElementsByClassName("action fulltext")[0].href
                    pdfLink = "https://projects.propublica.org/nonprofits".concat(RAWpdfLink.split("/nonprofits")[1])
                    console.log("retrieved link to most recent Form990.xml = " + xmlLink)
                    console.log("retrieved link to most recent pdf = " + pdfLink)
                    document.getElementsByClassName("pdf")[0].href = pdfLink
                    document.getElementsByClassName("xml")[0].href = xmlLink
                    document.getElementById("search").style.display = "none"
                    document.getElementById("main").style.display = "block"
                    document.getElementsByClassName("buttons")[0].style.display = "block"
                    parseLink(xmlLink)
                }
                else if (dom.getElementsByClassName("single-filing cf").length > 1 && dom.getElementsByClassName("action xml").length == 0) {
                    RAWpdfLink = dom.getElementsByClassName("action")[0].href
                    pdfLink = "https://projects.propublica.org/nonprofits".concat(RAWpdfLink.split("/nonprofits")[1])
                    console.log("retrieved link to most recent pdf = " + pdfLink)
                    document.getElementById("search").style.display = "none"
                    document.getElementById("onlyPDF").style.display = "block"
                    document.getElementsByClassName("pdf")[1].href = pdfLink

                }
                else {
                    document.getElementById("search").style.display = "none"
                    document.getElementById("sorry").style.display = "block"
                }
            }
        })
}

function tips() {
    document.getElementById("search").style.display = "none"
    document.getElementById("main").style.display = "none"
    document.getElementById("directions").style.display = "none"
    document.getElementById("sorry").style.display = "none"
    document.getElementById("tips").style.display = "block"

}
function directions() {
    document.getElementById("search").style.display = "none"
    document.getElementById("main").style.display = "none"
    document.getElementById("tips").style.display = "none"
    document.getElementById("sorry").style.display = "none"
    document.getElementById("directions").style.display = "block"
}

function tryAgain() {
    console.log("Trying Again")
    // document.getElementById("sorry").style = "display:none"
    // document.getElementById("tryAgain").style = "display:none"
    if (document.getElementById('otherOrgName').innerHTML != "") {
        console.log("testing second NPO option ")
        otherOrgName = JSON.parse(document.getElementById('otherOrgName').innerHTML)
        console.log("total results for " + otherOrgName.organizations[0].name + " " + otherOrgName.total_results)
        document.getElementById('otherOrgName').innerHTML = ""
        findEin(otherOrgName)
    }
    else {
        console.log("no other NPO name to test")
        document.getElementById("orgName").innerHTML = "Sorry, there are no other results!"
        document.getElementById("sorry").style.display = "block"
        document.getElementById("responseBody").style.display = "none"
        document.getElementsByClassName("buttons")[0].style.display = "none"
    }
}

function parseLink(xmlLink) {
    //this function pulls out all of the necessary 990 information to 
    //use in calculations that will inform us about a given NPO's 
    //overall charitable contribution 
    $.ajax({
        url: xmlLink,
        dataType: "xml",
        success: function (data) {
        }
    }).then(resp => {
        if (resp.getElementsByTagName('CYTotalRevenueAmt').length != 0) {
            CYTotalRevenueAmt = resp.getElementsByTagName('CYTotalRevenueAmt')[0].textContent
            console.log("total revenue: " + CYTotalRevenueAmt)
        }
        if (resp.getElementsByTagName('ManagementAndGeneralAmt').length != 0) {
            ManagementAndGeneralAmt = resp.getElementsByTagName('ManagementAndGeneralAmt')[0].textContent
            console.log("Mgmt and general expenses: " + ManagementAndGeneralAmt)
        }
        if (resp.getElementsByTagName('CYTotalProfFndrsngExpnsAmt').length != 0) {
            CYTotalProfFndrsngExpnsAmt = resp.getElementsByTagName('CYTotalProfFndrsngExpnsAmt')[0].textContent
            console.log("professional fundraising: " + CYTotalProfFndrsngExpnsAmt)
        }
        if (resp.getElementsByTagName('TotalFunctionalExpensesGrp').length != 0) {
            FundraisingAmt = resp.getElementsByTagName('TotalFunctionalExpensesGrp')[0].children[3].textContent
            console.log("Other Fundraising Expenses: " + FundraisingAmt)
            ProgramServicesAmt = resp.getElementsByTagName('TotalFunctionalExpensesGrp')[0].children[1].textContent
            console.log("Program Service Expenses: " + ProgramServicesAmt)
            TotalAmt = resp.getElementsByTagName('TotalFunctionalExpensesGrp')[0].children[0].textContent
            console.log("total expenses: " + TotalAmt)

            programServicesPERCENT = parseInt(ProgramServicesAmt) / parseInt(TotalAmt)
            document.getElementById("programServicesPERCENT").innerHTML = Math.round(programServicesPERCENT * 100) + "%"
            if (ManagementAndGeneralAmt) {
                mgmtAndGenPERCENT = parseInt(ManagementAndGeneralAmt) / parseInt(TotalAmt)
                document.getElementById("mgmtAndGenPERCENT").innerHTML = Math.round(mgmtAndGenPERCENT * 100) + "%"
            }
            if (CYTotalProfFndrsngExpnsAmt) {
                fundraisingPERCENT = (parseInt(FundraisingAmt) / parseInt(TotalAmt))
                document.getElementById("fundraisingPERCENT").innerHTML = Math.round(fundraisingPERCENT * 100) + "%"
            }
            if (CYTotalRevenueAmt) {
                netIncomeMarginPERCENT = (parseInt(CYTotalRevenueAmt) - parseInt(TotalAmt)) / parseInt(CYTotalRevenueAmt)
                document.getElementById("netIncomeMarginPERCENT").innerHTML = Math.round(netIncomeMarginPERCENT * 100) + "%"
            }

        } else {
            document.getElementById("responseBody").style = "display:none"
            document.getElementById("sorry").style = "display:block"
        }
        if (resp.getElementsByTagName('CashNonInterestBearingGrp').length != 0 && resp.getElementsByTagName('SavingsAndTempCashInvstGrp').length != 0) {
            CashNonInterestBearingGrp = resp.getElementsByTagName('CashNonInterestBearingGrp')[0].children[1].textContent
            SavingsAndTempCashInvstGrp = resp.getElementsByTagName('SavingsAndTempCashInvstGrp')[0].children[1].textContent
            CashAndInvestments = parseInt(CashNonInterestBearingGrp) + parseInt(SavingsAndTempCashInvstGrp)
            console.log("Cash AND Investments: " + CashAndInvestments)
            if (CYTotalRevenueAmt) {
                cashPERCENT = CashAndInvestments / parseInt(CYTotalRevenueAmt)
                document.getElementById("cashPERCENT").innerHTML = Math.round(cashPERCENT * 100) + "%"
            }
        } else if (resp.getElementsByTagName('CashNonInterestBearingGrp').length != 0) {
            CashNonInterestBearingGrp = resp.getElementsByTagName('CashNonInterestBearingGrp')[0].children[1].textContent
            if (CYTotalRevenueAmt) {
                cashPERCENT = parseInt(CashNonInterestBearingGrp) / parseInt(CYTotalRevenueAmt)
                document.getElementById("cashPERCENT").innerHTML = Math.round(cashPERCENT * 100) + "%"
            }
        }
        else if (resp.getElementsByTagName('SavingsAndTempCashInvstGrp').length != 0) {
            SavingsAndTempCashInvstGrp = resp.getElementsByTagName('SavingsAndTempCashInvstGrp')[0].children[1].textContent
            if (CYTotalRevenueAmt) {
                cashPERCENT = parseInt(SavingsAndTempCashInvstGrp) / parseInt(CYTotalRevenueAmt)
                document.getElementById("cashPERCENT").innerHTML = Math.round(cashPERCENT * 100) + "%"
            }
        }
        if (resp.getElementsByTagName('TotalAssetsEOYAmt').length != 0) {
            TotalAssetsEOYAmt = resp.getElementsByTagName('TotalAssetsEOYAmt')[0].textContent
            console.log("total assests: " + TotalAssetsEOYAmt)
        }
        if (resp.getElementsByTagName('TotalLiabilitiesEOYAmt').length != 0) {
            TotalLiabilitiesEOYAmt = resp.getElementsByTagName('TotalLiabilitiesEOYAmt')[0].textContent
            console.log("total liabilities: " + TotalLiabilitiesEOYAmt)
        }
    })
}
