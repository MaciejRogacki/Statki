var flotaGracza, flotoKomputera;
var prubaAtaku = [];


function Flota(nazwaStatku) {
	this.nazwaStatku = nazwaStatku;
	this.parametryStatku = [{ "nazwaStatku": "Lotniskowiec", "length": 5 },
						{ "nazwaStatku": "Pancernik", "length": 4 },
						{ "nazwaStatku": "Krążownik", "length": 3 },
						{ "nazwaStatku": "Niszczyciel", "length": 3 },
						{ "nazwaStatku": "Kuter", "length": 2 }];
	this.liczbaStatkow = this.parametryStatku.length;
	this.statki = [];
	this.wielkoscObecnegoStatku = 0;
	this.obecnyStatek = 0;
	this.utworzStatki = function() {
		for(var i = 0; i < this.liczbaStatkow; i++) {
			this.statki[i] = new Statek(this.parametryStatku[i].nazwaStatku);
			this.statki[i].length = this.parametryStatku[i].length;
		}
	};
	this.usunStatek = function(pos) {
		this.liczbaStatkow--;
		$(".tekst").text(komunikat.zatopiony(this.nazwaStatku, this.statki[pos].nazwaStatku));
		if (this == flotaGracza) komputerBOT.wielkoscZatopionegoStatku = this.statki[pos].length;
		this.statki.splice(pos, 1);
		if (this.statki.length == 0) {
			$(".tekst").text(komunikat.przegrana(this.nazwaStatku));
		}
		return true;
	};
	this.trafienieStatku = function(nazwa_statku) {
		$(".tekst").text(komunikat.trafienie(this.nazwaStatku));
		return true;
	}
	this.czyTrafiony = function(punkt) {
		for(var i = 0; i < this.liczbaStatkow; i++) {
			if (this.statki[i].sprawdzPolozenie(punkt)) {
				this.statki[i].usun(this.statki[i].punktyZycia.indexOf(punkt));
				if (this.statki[i].punktyZycia == 0)return this.usunStatek(i);
				else return this.trafienieStatku(this.statki[i].nazwaStatku);
			}
		}
		return false;
	};
}

function Statek(nazwaStatku){
	this.nazwaStatku = nazwaStatku;
	this.length = 0;
	this.punktyZycia = [];
	this.ustalZyciaDlaPoziomego = function(start) {
		for (var i = 0; i < this.length; i++, start++) {
			this.punktyZycia[i] = start;
		}
	};
	this.ustalZyciaDlaPionowego = function(start) {
		for (var i = 0; i < this.length; i++, start += 10) {
			this.punktyZycia[i] = start;
		}
	};
	this.sprawdzPolozenie = function(loc) {
		for (var i = 0; i < this.length; i++) {
			if (this.punktyZycia[i] == loc) return true;		
		}
		return false;
	};
	this.usun = function(pos) {
		this.punktyZycia.splice(pos, 1);
	}
}


var komunikat = {
	"powitanie": " Witaj w grze w STATKI! Użyj monu powyżej aby rozpocząć.",
	"blad": " UPS coś poszło nie tak! :(.",
	"gracz1": " Wybierz czy chcesz rozstawić swoją flotę samodzielnie czy ma zrobić to komputer.",
	"samodzielnie": " Użyj myszy aby rozstawić flotę na lewej dolnej planszy. Możesz obracać statki przyciskami powyżej.",
	"zachodzenie": " Statki nie mogą na siebie zachodzić!",
	"start": " Wszystko gotowe! Użyj myszy na lewej górnej planszy aby oddać strzał.",
	umieszczony: function(nazwaStatku) { return " " + nazwaStatku + " został rozstawiony."; },
	trafienie: function(nazwaStatku, typ) { return " Statek " + nazwaStatku + "a został trafiony." },
	pudlo: function(nazwaStatku) { return " " + nazwaStatku + " spudłował!" },
	zatopiony: function(nazwaStatku, typ) { return " " + typ + " " + nazwaStatku + "a został zatopiony!" },
	przegrana: function(nazwaStatku) { return " " + nazwaStatku + " stracił całą flotę! Koniec gry, naciśnij F5 aby rozpocząć nową rozgrywkę." },
};

var planszaGorna = {
	wszystkieTrafienia: [],
	podswietlenie: function(square) {
		$(square).addClass("cel").off("mouseleave").on("mouseleave", function() {
			$(this).removeClass("cel"); 
		});

		$(square).off("click").on("click", function() {
			if(!($(this).hasClass("used"))) {
				$(this).removeClass("cel").addClass("used");
				var num = parseInt($(this).attr("class").slice(15));
				var bool = flotoKomputera.czyTrafiony(num);
				if (false == bool) {
					$(".tekst").text(komunikat.pudlo("Gracz"));
					$(this).children().addClass("pudlo");
				} else $(this).children().addClass("trafienie");
				$(".planszag").find(".pola").off("mouseenter").off("mouseover").off("mouseleave").off("click");
				if (flotoKomputera.statki.length == 0) {
 					$(".planszag").find(".pola").off("mouseenter").off("mouseover").off("mouseleave").off("click");
 				} else setTimeout(komputerBOT.select, 800);
			} 
		});
	},
}

var planszaDolna = {
	obecneTrafienia: [],
	sprawdzRuch: function(trafienie) {
		if (flotaGracza.czyTrafiony(trafienie)) {
			planszaDolna.obecneTrafienia.push(trafienie);
      if (this.obecneTrafienia.length > 1) komputerBOT.poprzednio_trafiony = true;
			$(".planszad").find("." + trafienie).children().addClass("trafienie");
			if (planszaDolna.zostalZatopiony()) {
				komputerBOT.zatapianie = komputerBOT.poprzednio_trafiony = false;
				if (komputerBOT.wielkoscZatopionegoStatku == planszaDolna.obecneTrafienia.length) {
					komputerBOT.ilosc_spudlowana = komputerBOT.licznik_wsteczny = komputerBOT.kolejnyRuch.length = planszaDolna.obecneTrafienia.length = komputerBOT.wielkoscZatopionegoStatku = komputerBOT.currrent = 0;
				} else {
					komputerBOT.szablonRuchu =  komputerBOT.przypadek1 = true;
				}
				if (komputerBOT.szablonRuchuTrafienie.length > 0) komputerBOT.szablonRuchu = true;
			}
			return true;
		} else {
			$(".planszad").find("." + trafienie).children().addClass("pudlo");
			komputerBOT.obecny = planszaDolna.obecneTrafienia[0];
			komputerBOT.poprzednio_trafiony = false;
			if (planszaDolna.obecneTrafienia.length > 1) {
				komputerBOT.rufa = true;
				komputerBOT.ilosc_spudlowana++;
			}
			if (komputerBOT.przypadek2) {
				komputerBOT.szablonRuchu = true;
				komputerBOT.przypadek2 = false;
			}
			return false;
		}
	},

	zostalZatopiony: function() {
		if (komputerBOT.wielkoscZatopionegoStatku > 0) return true;
		else return false;
	}
}


var komputerBOT = {
	rufa: false,
	zatapianie: false,
	poprzednio_trafiony: false,
	pierwsze_trafienie: false,
	szablonRuchu: false,
	przypadek1: false,
	przypadek2: false,
	ilosc_spudlowana: 0,
	licznik_wsteczny: 0,
	pulaRuchu: [],
	kolejnyRuch: [],
	ruchy: [],
	szablonRuchuTrafienie: [],
	kierunek: "",
	obecny: 0,
	iloscStrzalowPoTrafieniu: 0,
	wielkoscZatopionegoStatku: 0,
	randomGen: function(size) {
		return Math.floor(Math.random() * size);
	},
	select: function() {
		if (komputerBOT.zatapianie) {
			komputerBOT.ruchyKomputera();
		} else if (komputerBOT.szablonRuchu) {
			komputerBOT.przypadekSpecjalny();
		} else {
			komputerBOT.obecny = komputerBOT.pulaRuchu[komputerBOT.randomGen(komputerBOT.pulaRuchu.length)];
			komputerBOT.ruchy.push(komputerBOT.obecny);
			komputerBOT.pierwsze_trafienie = true;
			komputerBOT.usunLos(komputerBOT.pulaRuchu.indexOf(komputerBOT.obecny));
			komputerBOT.zatapianie = planszaDolna.sprawdzRuch(komputerBOT.obecny);
		}
		setTimeout(podswietlPlansze(), 50);
	},

	usunLos: function(index) {
		komputerBOT.pulaRuchu.splice(index, 1);
	},

	ruchyKomputera: function() {
		if (komputerBOT.pierwsze_trafienie) {
			komputerBOT.utworzRuch();
			komputerBOT.pierwsze_trafienie = false;
		}

		if (komputerBOT.ilosc_spudlowana > 1) {
			komputerBOT.przypadekSpecjalny();
		} else if (komputerBOT.rufa) {
			komputerBOT.rufa = false;
			komputerBOT.wsteczY();
			komputerBOT.pokarzTrafienie(komputerBOT.obecny);
		} else if (komputerBOT.poprzednio_trafiony) {
			komputerBOT.kontynulujTrafienia();
			komputerBOT.pokarzTrafienie(komputerBOT.obecny);
			console.log(komputerBOT.poprzednio_trafiony);
		} else {
			komputerBOT.kierunek = komputerBOT.kolejnyRuch.pop();
			console.log(komputerBOT.kierunek + " " + komputerBOT.obecny);
			komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
			komputerBOT.poprzednio_trafiony = komputerBOT.pokarzTrafienie(komputerBOT.obecny);
			console.log(komputerBOT.poprzednio_trafiony);
		}
	},

	pokarzTrafienie: function(trafienie) {
		if (komputerBOT.szablonRuchu) {
			komputerBOT.przypadekSpecjalny();
		} else {
			komputerBOT.ruchy.push(trafienie);
			komputerBOT.usunLos(komputerBOT.pulaRuchu.indexOf(trafienie));
			return planszaDolna.sprawdzRuch(trafienie);
		}
	},

	utworzRuch: function() {
		if(komputerBOT.obecny == 1) {
			komputerBOT.pobierzLosoyRuch(["prawo", "dol"]);
		}
		else if(komputerBOT.obecny == 10) {
			komputerBOT.pobierzLosoyRuch(["lewo", "dol"]);
		}
		else if(komputerBOT.obecny == 91) {
			komputerBOT.pobierzLosoyRuch(["gora", "prawo"]);
		} 
		else if(komputerBOT.obecny == 100) {
			komputerBOT.pobierzLosoyRuch(["lewo", "gora"]);
		}
		else if(!(komputerBOT.obecny % 10)){
			komputerBOT.pobierzLosoyRuch(["gora", "dol", "lewo"]);
		}
		else if(komputerBOT.obecny < 10) {
			komputerBOT.pobierzLosoyRuch(["prawo", "dol", "lewo"]);
		}
		else if(komputerBOT.obecny % 10 == 1) {
			komputerBOT.pobierzLosoyRuch(["gora", "prawo", "dol"]);
		}
		else if(komputerBOT.obecny > 91) {
			komputerBOT.pobierzLosoyRuch(["gora", "prawo", "lewo"]);
		}
		else {
			komputerBOT.pobierzLosoyRuch(["gora", "prawo", "dol", "lewo"]);
		}
	},

	pobierzLosoyRuch: function(mozliweRuchy) {
		while (mozliweRuchy.length != 0) {
			var obecnyKierunek = komputerBOT.randomGen(mozliweRuchy.length);
			if (mozliweRuchy[obecnyKierunek] == "gora") {
				if (komputerBOT.pulaRuchu.some(function(x) { return x == komputerBOT.obecny - 10; })) {
					komputerBOT.kolejnyRuch.push("gora");
				}
			}
			if (mozliweRuchy[obecnyKierunek] == "prawo") {
				if (komputerBOT.pulaRuchu.some(function(x) { return x == komputerBOT.obecny + 1; })) {
					komputerBOT.kolejnyRuch.push("prawo");
				}
			}
			if (mozliweRuchy[obecnyKierunek] == "dol") {
				if (komputerBOT.pulaRuchu.some(function(x) { return x == komputerBOT.obecny + 10; })) {
					komputerBOT.kolejnyRuch.push("dol");
				}
			}
			if (mozliweRuchy[obecnyKierunek] == "lewo") {
				if (komputerBOT.pulaRuchu.some(function(x) { return x == komputerBOT.obecny - 1; })) {
					komputerBOT.kolejnyRuch.push("lewo");
				}
			}
			mozliweRuchy.splice(obecnyKierunek, 1);
		}
	},

	pobierzKoordynaty: function(obecnyKierunek) {
		if (obecnyKierunek == "gora") komputerBOT.obecny -= 10;
		if (obecnyKierunek == "prawo") komputerBOT.obecny += 1;
		if (obecnyKierunek == "dol") komputerBOT.obecny += 10;
		if (obecnyKierunek == "lewo") komputerBOT.obecny -= 1;
		console.log(komputerBOT.obecny + " ruchy " + komputerBOT.ruchy);
		if (komputerBOT.ruchy.some(function(x) { return x == komputerBOT.obecny; }) && komputerBOT.szablonRuchuTrafienie.length == 0) {
			komputerBOT.obecny = planszaDolna.obecneTrafienia[0];
			if (komputerBOT.licznik_wsteczny > 1) komputerBOT.szablonRuchu = true;
			else komputerBOT.wsteczY();
		}
		return false;
	},

	kontynulujTrafienia: function() {
		console.log("kontynuluj " + komputerBOT.kierunek);
		if (komputerBOT.kierunek == "gora") {
			if (komputerBOT.sprawdzPolozenie("gora")) {
				komputerBOT.kierunek = "dol";
				return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
			} else return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
		}
		if (komputerBOT.kierunek == "prawo") {
			if (komputerBOT.sprawdzPolozenie("prawo")) {
				komputerBOT.kierunek = "lewo";
				return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
			} else return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
		}
		if (komputerBOT.kierunek == "dol") {
			if (komputerBOT.sprawdzPolozenie("dol")) {
				komputerBOT.kierunek = "gora";
				return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
			} else return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
		}
		if (komputerBOT.kierunek == "lewo") {
			if (komputerBOT.sprawdzPolozenie("lewo")) {
				komputerBOT.kierunek = "prawo";
				return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
			} else return komputerBOT.pobierzKoordynaty(komputerBOT.kierunek);
		}
	},

	wsteczY: function() {
		komputerBOT.licznik_wsteczny++;
		if (komputerBOT.kierunek == "gora") {
			komputerBOT.kierunek = "dol";
			return komputerBOT.kontynulujTrafienia();
		}
		if (komputerBOT.kierunek == "prawo") {
			komputerBOT.kierunek = "lewo";
			return komputerBOT.kontynulujTrafienia();
		}
		if (komputerBOT.kierunek == "dol") {
			komputerBOT.kierunek = "gora";
			return komputerBOT.kontynulujTrafienia();
		}
		if (komputerBOT.kierunek == "lewo") {
			komputerBOT.kierunek = "prawo";
			return komputerBOT.kontynulujTrafienia();
		}
	},

	sprawdzPolozenie: function(obecnyKierunek) {
		if (obecnyKierunek == "gora") {
			if (komputerBOT.obecny < 11) return true
		}
		if (obecnyKierunek == "prawo") {
			if (komputerBOT.obecny % 10 == 0) return true
		}
		if (obecnyKierunek == "dol") {
			if (komputerBOT.obecny > 90) return true
		}
		if (obecnyKierunek == "lewo") {
			if (komputerBOT.obecny % 10 == 1) return true
		}
		return false;
	},

	przypadekSpecjalny: function() {
		komputerBOT.ilosc_spudlowana = komputerBOT.licznik_wsteczny = komputerBOT.kolejnyRuch.length = 0;
		if (komputerBOT.przypadek1) {
			komputerBOT.poprzednio_trafiony = true;
			if (komputerBOT.pobierzNowyCel(komputerBOT.kierunek)) {
				planszaDolna.obecneTrafienia.length = 0;
				planszaDolna.obecneTrafienia.push(komputerBOT.obecny);
				komputerBOT.pierwsze_trafienie = true;
				komputerBOT.poprzednio_trafiony = false;
			}
			komputerBOT.szablonRuchu = komputerBOT.przypadek1 = komputerBOT.rufa = false;
			komputerBOT.zatapianie = true;
			komputerBOT.wielkoscZatopionegoStatku = 0;
			komputerBOT.ruchyKomputera();
		} else {
			if (komputerBOT.szablonRuchuTrafienie.length == 0) {
				for(var i = 0; i < planszaDolna.obecneTrafienia.length; i++) {
					komputerBOT.szablonRuchuTrafienie.push(planszaDolna.obecneTrafienia[i]);
				}
				planszaDolna.obecneTrafienia.length = 0;
			}
			komputerBOT.obecny = komputerBOT.szablonRuchuTrafienie.pop();
			planszaDolna.obecneTrafienia.push(komputerBOT.obecny);
			komputerBOT.szablonRuchu = komputerBOT.rufa = komputerBOT.poprzednio_trafiony = false;
			komputerBOT.pierwsze_trafienie = komputerBOT.zatapianie = true;
			komputerBOT.ruchyKomputera();
		}
	},

	pobierzNowyCel: function(kierunek) {
		var pozostaleZycia = planszaDolna.obecneTrafienia.length - komputerBOT.wielkoscZatopionegoStatku;
		if (komputerBOT.kierunek == "gora") {
			komputerBOT.kierunek = "dol";
			if (pozostaleZycia > 1) {
				komputerBOT.obecny += 10 * (planszaDolna.obecneTrafienia.length - 1);
				var temp = komputerBOT.obecny + (10 * (pozostaleZycia - 1));
				planszaDolna.obecneTrafienia.length = 0;
				for (var i = 0; i < pozostaleZycia; i++) {
					planszaDolna.obecneTrafienia.push(temp);
					temp += 10;
				}
				komputerBOT.przypadek2 = true;
				return false;
			}
			komputerBOT.obecny += 10 * komputerBOT.wielkoscZatopionegoStatku;
			return true;
		}
		if (komputerBOT.kierunek == "prawo") {
			komputerBOT.kierunek = "lewo";
			if (pozostaleZycia > 1) {
				komputerBOT.obecny -= planszaDolna.obecneTrafienia.length - 1;
				var temp = komputerBOT.obecny + (pozostaleZycia - 1);
				planszaDolna.obecneTrafienia.length = 0;
				for (var i = 0; i < pozostaleZycia; i++) {
					planszaDolna.obecneTrafienia.push(temp);
					temp -= 1;
				}
				komputerBOT.przypadek2 = true;
				return false;
			}
			komputerBOT.obecny -= komputerBOT.wielkoscZatopionegoStatku;
			return true;
		}
		if (komputerBOT.kierunek == "dol") {
			komputerBOT.kierunek = "gora";
			if (pozostaleZycia > 1) {
				komputerBOT.obecny -= 10 * (planszaDolna.obecneTrafienia.length - 1);
				var temp = komputerBOT.obecny - (10 * (pozostaleZycia - 1));
				planszaDolna.obecneTrafienia.length = 0;
				for (var i = 0; i < pozostaleZycia; i++) {
					planszaDolna.obecneTrafienia.push(temp);
					temp -= 10;
				}
				komputerBOT.przypadek2 = true;
				return false;
			}
			komputerBOT.obecny -= 10 * komputerBOT.wielkoscZatopionegoStatku;
			return true;
		}
		if (komputerBOT.kierunek == "lewo") {
			komputerBOT.kierunek = "prawo";
			if (pozostaleZycia > 1) {
				komputerBOT.obecny += planszaDolna.obecneTrafienia.length - 1;
				var temp = komputerBOT.obecny - (pozostaleZycia - 1);
				planszaDolna.obecneTrafienia.length = 0;
				for (var i = 0; i < pozostaleZycia; i++) {
					planszaDolna.obecneTrafienia.push(temp);
					temp += 1;
				}
				komputerBOT.przypadek2 = true;
				return false;
			}
			komputerBOT.obecny += komputerBOT.wielkoscZatopionegoStatku;
			return true;
		}
	}
}


$(document).ready(function() {
	for (var i = 1; i <= 100; i++) {

		if (i < 11) {
			$(".planszag").prepend("<span class='legendaGora'>" + Math.abs(i - 11) + "</span>");
			$(".planszad").prepend("<span class='legendaGora'>" + Math.abs(i - 11) + "</span>");
			$(".siatka").append("<li class='pola offset1 " + i + "'><span class='pole'></span></li>");
		} else {
			$(".siatka").append("<li class='pola offset2 " + i + "'><span class='pole'></span></li>");
		}
		if (i == 11) {
			$(".planszag").prepend("<span class='legendaGora ukryjzero'>" + Math.abs(i - 11) + "</span>");
			$(".planszad").prepend("<span class='legendaGora ukryjzero'>" + Math.abs(i - 11) + "</span>");
		}
		if (i > 90) {
			$(".planszag").append("<span class='legendaLewo'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
			$(".planszad").append("<span class='legendaLewo'>" + 
								String.fromCharCode(97 + (i - 91)).toUpperCase() + "</span>");
		}
	}
	$(".tekst").text(komunikat.powitanie);
})


$(document).ready(function() {
	$(".przycisk1").on("click", function() {
		$(".tekst").text(komunikat.gracz1);
		ustaieniaGry(this);
	});
	$(".przycisk2").on("click", function(e) {
		e.preventDefault();
		if (!$("div").hasClass("error")) {
			$(".tekst").text(komunikat.blad);
			$(this).addClass("error");
		}
	});
});

function ustaieniaGry(t) {
	$(t).off() && $(".two").off();
	$(".przycisk1").addClass("samodzielnie").removeClass("przycisk1").text("Rozstaw samodzielnie");
	$(".przycisk2").addClass("losowo").removeClass("przycisk2").text("Rozstaw losowo");

	$(".samodzielnie").off("click").on("click", function() {
		$(".tekst").text(komunikat.samodzielnie);
		rozstawSam(flotaGracza);
	});
	$(".losowo").off("click").on("click", function() {
		flotaGracza = new Flota("Gracz");
		flotaGracza.utworzStatki();
		rozstawLosowo(flotaGracza);
	});
}


function rozstawSam() {
	$(".samodzielnie").addClass("poziomo").removeClass("samodzielnie").text("Obróć poziomo");
	$(".losowo").addClass("pionowo").removeClass("losowo").text("Obróć pionowo");
	flotaGracza = new Flota("Gracz");
	flotaGracza.utworzStatki();

	rozstawStatki(flotaGracza.statki[flotaGracza.obecnyStatek], flotaGracza);
}

function rozstawLosowo(Flota) {
	if (Flota.obecnyStatek >= Flota.liczbaStatkow) return;
	
	var orien = Math.floor((Math.random() * 10) + 1);
	var length = Flota.statki[Flota.obecnyStatek].length;
	
	if (orien < 6) {
		var statekPrzesuniecie = 11 - Flota.statki[Flota.obecnyStatek].length; 
		var pozi = Math.floor((Math.random() * statekPrzesuniecie) + 1);
		var pionowo = Math.floor(Math.random() * 9);
		var randNum = parseInt(String(pionowo) + String(pozi));
		if (Flota == flotoKomputera) sprawdzCzyZachodza(randNum, length, "poziomo", Flota);
		else ustawStatek(randNum, Flota.statki[Flota.obecnyStatek], "poziomo", Flota, "losowo");
	} else {
		var statekPrzesuniecie = 110 - (Flota.statki[Flota.obecnyStatek].length * 10);
		var randNum = Math.floor((Math.random() * statekPrzesuniecie) + 1);
	
		if (Flota == flotoKomputera) sprawdzCzyZachodza(randNum, length, "pionowo", Flota); 
		else ustawStatek(randNum, Flota.statki[Flota.obecnyStatek], "pionowo", Flota, "losowo");
	}
}

function utworzFloteKomputera() {
	flotoKomputera = new Flota("Komputer");
	flotoKomputera.utworzStatki();
	rozstawLosowo(flotoKomputera);
}


function rozstawStatki(Statek, Flota) {
	var orientacja = "poziomo";
	$(".pionowo").off("click").on("click", function() {
		orientacja = "pionowo";
	});
	$(".poziomo").off("click").on("click", function() {
		orientacja = "poziomo";
	});
	$(".planszad").find(".pola").off("mouseenter").on("mouseenter", function() {
		var num = $(this).attr('class').slice(15);
		//
		if (orientacja == "poziomo") wyswietlStatekPoziomo(parseInt(num), Statek, this, Flota);
		else wyswietlStatekPionowo(parseInt(num), Statek, this, Flota);
	});
}


function wyswietlStatekPoziomo(polozenie, Statek, punkt, Flota) {
	var endPoint = polozenie + Statek.length - 2;
	if (!(endPoint % 10 >= 0 && endPoint % 10 < Statek.length - 1)) {
		for (var i = polozenie; i < (polozenie + Statek.length); i++) {
			$(".planszad ." + i).addClass("podswietlenie");
		}
		$(punkt).off("click").on("click", function() {
			ustawStatek(polozenie, Statek, "poziomo", Flota, "samodzielnie");
		});
	}
	$(punkt).off("mouseleave").on("mouseleave", function() {
		usunStatekPoziomo(polozenie, Statek.length);
	});
}

function wyswietlStatekPionowo(polozenie, Statek, punkt, Flota) {
	var endPoint = (Statek.length * 10) - 10;
	var inc = 0; 
	if (polozenie + endPoint <= 100) {
		for (var i = polozenie; i < (polozenie + Statek.length); i++) {
			$(".planszad ." + (polozenie + inc)).addClass("podswietlenie");
			inc = inc + 10;
		}
		$(punkt).off("click").on("click", function() {
			ustawStatek(polozenie, Statek, "pionowo", Flota, "samodzielnie");
		});
	}
	$(punkt).off("mouseleave").on("mouseleave", function() {
		usunStatekPionowo(polozenie, Statek.length);
	});
}

function usunStatekPoziomo(polozenie, length) {
	for (var i = polozenie; i < polozenie + length; i++) {
		$(".planszad ." + i).removeClass("podswietlenie");
	}
}

function usunStatekPionowo(polozenie, length) {
	var inc = 0;
	for (var i = polozenie; i < polozenie + length; i++) {
		$(".planszad ." + (polozenie + inc)).removeClass("podswietlenie");
		inc = inc + 10;
	}
}

function ustawStatek(polozenie, Statek, orientacja, podstawowaFlota, typ) {
	if (!(sprawdzCzyZachodza(polozenie, Statek.length, orientacja, podstawowaFlota))) {
		if (orientacja == "poziomo") {
			podstawowaFlota.statki[podstawowaFlota.obecnyStatek].ustalZyciaDlaPoziomego(polozenie);
			$(".tekst").text(komunikat.umieszczony(podstawowaFlota.statki[podstawowaFlota.obecnyStatek].nazwaStatku ));
			for (var i = polozenie; i < (polozenie + Statek.length); i++) {
				$(".planszad ." + i).addClass(podstawowaFlota.statki[podstawowaFlota.obecnyStatek].nazwaStatku);
				$(".planszad ." + i).children().removeClass("pole");
			}
			if (++podstawowaFlota.obecnyStatek == podstawowaFlota.liczbaStatkow) {
				$(".tekst").text(komunikat.umieszczony("Kuter "));
				$(".planszad").find(".pola").off("mouseenter");
				setTimeout(utworzFloteKomputera, 100);
			} else {
				if (typ == "losowo") rozstawLosowo(podstawowaFlota);
				else rozstawStatki(podstawowaFlota.statki[podstawowaFlota.obecnyStatek], podstawowaFlota);
			}
			
		} else {
			var inc = 0;
			podstawowaFlota.statki[podstawowaFlota.obecnyStatek].ustalZyciaDlaPionowego(polozenie);
			$(".tekst").text(komunikat.umieszczony(podstawowaFlota.statki[podstawowaFlota.obecnyStatek].nazwaStatku));
			for (var i = polozenie; i < (polozenie + Statek.length); i++) {
				$(".planszad ." + (polozenie + inc)).addClass(podstawowaFlota.statki[podstawowaFlota.obecnyStatek].nazwaStatku);
				$(".planszad ." + (polozenie + inc)).children().removeClass("pole");
				inc = inc + 10;
			}
			if (++podstawowaFlota.obecnyStatek == podstawowaFlota.liczbaStatkow) {
				$(".tekst").text(komunikat.umieszczony("Statki zostały"));
				$(".planszad").find(".pola").off("mouseenter");
				// clear the call stack
				setTimeout(utworzFloteKomputera, 100);
			} else {
				if (typ == "losowo") rozstawLosowo(podstawowaFlota);
				else rozstawStatki(podstawowaFlota.statki[podstawowaFlota.obecnyStatek], podstawowaFlota);
			}
		}
	} else {
		if (typ == "losowo") rozstawLosowo(podstawowaFlota);
		else $(".tekst").text(komunikat.zachodzenie);
	}
 }

 function sprawdzCzyZachodza(polozenie, length, orientacja, utworzFlote) {
 	var loc = polozenie;
 	if (orientacja == "poziomo") {
 		var end = polozenie + length;
	 	for (; polozenie < end; polozenie++) {
	 		for (var i = 0; i < utworzFlote.obecnyStatek; i++) {
	 			if (utworzFlote.statki[i].sprawdzPolozenie(polozenie)) {
	 				if (utworzFlote == flotoKomputera) rozstawLosowo(utworzFlote);
	 				else return true;
	 			}
	 		}
	 	}
	 } else {
	 	var end = polozenie + (10 * length);
	 	for (; polozenie < end; polozenie += 10) {
	 		for (var i = 0; i < utworzFlote.obecnyStatek; i++) {
	 			if (utworzFlote.statki[i].sprawdzPolozenie(polozenie)) {
	 				if (utworzFlote == flotoKomputera) rozstawLosowo(utworzFlote);
	 				else return true;
	 			}
	 		}
	 	}
	 } 
	if (utworzFlote == flotoKomputera && utworzFlote.obecnyStatek < utworzFlote.liczbaStatkow) {
		if (orientacja == "poziomo") utworzFlote.statki[utworzFlote.obecnyStatek++].ustalZyciaDlaPoziomego(loc);
	 	else utworzFlote.statki[utworzFlote.obecnyStatek++].ustalZyciaDlaPionowego(loc);
	 	if (utworzFlote.obecnyStatek == utworzFlote.liczbaStatkow) {
	 		setTimeout(startGry, 500);
	 	} else rozstawLosowo(utworzFlote);
	 }
	return false;
 }

function startGry() {
 	$(".oknoPrzyciskow").fadeOut("fast", function() {
 		$(".oknoKomunikatow").css( { "margin-top" : "31px" } );
 	});
 	$(".tekst").text(komunikat.start);
 	for (var i = 0; i < 100; i++) komputerBOT.pulaRuchu[i] = i + 1;
 	podswietlPlansze();
 }

 function podswietlPlansze() {
 	if (flotaGracza.statki.length == 0) {
 		$(".planszag").find(".pola").off("mouseenter").off("mouseleave").off("click");
 	} else {
	 	$(".planszag").find(".pola").off("mouseenter mouseover").on("mouseenter mouseover", function() {
			if(!($(this).hasClass("used"))) planszaGorna.podswietlenie(this);
		});
	 }
}


