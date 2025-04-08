<script src="../js/console_tramite_area.js?rev=<?php echo time();?>"></script>
<link rel="stylesheet" href="../plantilla/plugins/icheck-bootstrap/icheck-bootstrap.min.css">

    <!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">MANTENIMIENTO TRAMITE</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="#">Home</a></li>
              <li class="breadcrumb-item active">Tramite</li>
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->

    <!-- Main content -->
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <!-- /.col-md-6 -->
          <div class="col-lg-12">
            <div class="card">
              <div class="card-header">
                <h3  class="card-title">Listado de tramites</h3>
                <button class="btn btn-danger btn-sm float-right" onclick="cargar_contenido('contenido_principal','tramite_area/view_tramite_registro.php')"> <i class="fas fa-plus"> </i>Nuevo Registro</button>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 table-responsive">
                    <table id="tabla_tramite" class="display compact" style="width:100%">
                        <thead>
                            <tr>
                                <th>Nro Seguimiento</th>
                                <th>Nro Documento</th>
                                <th>Tipo Documento</th>
                                <th>Dni Remi</th>
                                <th>Remitente</th>
                                <th>Mas Datos</th>
                                <th>Seguimiento</th>
                                <th>Aréa Origen</th>
                                <th>Aréa Localizado</th>
                                <th>Estado Documento</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                    </table>
                  </div>
                  
                </div>
              </div>
            
            </div>

          </div>
          <!-- /.col-md-6 -->
        </div>
        <!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content -->
        <!-- Modal -->
<div class="modal fade" id="modal_seguimiento"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="lbl_titulo">SEGUIMIENTO DEL TRAMITE</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-12">
              <table id="tabla_seguimiento" class="display compact" style="width:100%">
                  <thead>
                      <tr>
                          <th>PROCEDENCIA</th>
                          <th>FECHA</th>
                          <th>DESCRIPCIÓN</th>
                          <th>ARCHIVO ANEXADO</th>
                      </tr>
                  </thead>
              </table>
            </div>
      
        </div>
      </div>
      <div class="modal-footer">
  
      </div>
    </div>
  </div>
</div>  

        <!-- Modal -->
<div class="modal fade" id="modal_mas"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
      <h5 class="modal-title" id="lbl_titulo_datos">DATOS DEL TRAMITE</h5>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-12">
            <div class="card card-primary card-tabs">
              <div class="card-header p-0 pt-1">
                <ul class="nav nav-tabs" id="custom-tabs-one-tab" role="tablist">
                  <li class="nav-item">
                    <a class="nav-link active" id="custom-tabs-one-home-tab" data-toggle="pill" href="#custom-tabs-one-home" role="tab" aria-controls="custom-tabs-one-home" aria-selected="true">Información</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" id="custom-tabs-one-profile-tab" data-toggle="pill" href="#custom-tabs-one-profile" role="tab" aria-controls="custom-tabs-one-profile" aria-selected="false">Datos Remitente</a>
                  </li>
                
                </ul>
              </div>
              <div class="card-body">
                <div class="tab-content" id="custom-tabs-one-tabContent">
                  <div class="tab-pane fade show active" id="custom-tabs-one-home" role="tabpanel" aria-labelledby="custom-tabs-one-home-tab">
                  <div class="row">
                            <div class="col-12 form-group">
                                <label for="" style="font-size:small;">PROCEDENCIA DEL DOCUMENTO</label>
                                <select class="js-example-basic-single" id="select_area_p" disabled style="width:100%;background-color:white">
                                </select>
                            </div>
                            <div class="col-12 form-group">
                                <label for="" style="font-size:small;">AREA DE DESTINO</label>
                                <select class="js-example-basic-single" id="select_area_d" style="width:100%;background-color:white" disabled>
                                </select>
                            </div>
                            <div class="col-12 form-group">
                                <label for="" style="font-size:small;">TIPO DOCUMENTO</label>
                                <select class="js-example-basic-single" id="select_tipo" style="width:100%;background-color:white" disabled>
                                </select>
                            </div>
                            <div class="col-8 form-group">
                                <label for="" style="font-size:small;">Nº DOCUMENTO</label>
                                <input type="text" class="form-control" id="txt_ndocumento"  style="background-color:white" readonly>
                            </div>
                            <div class="col-4 form-group">
                                <label for="" style="font-size:small;">Nº FOLIOS</label>
                                <input type="text" class="form-control" id="txt_folio" readonly style="background-color:white">
                            </div>
                            <div class="col-12 form-group">
                                <label for="" style="font-size:small;">ASUNTO DEL TRAMITE</label>
                                <textarea  id="txt_asunto" rows="3" class="form-control" style="resize:none;background-color:white" readonly></textarea>
                            </div>
                           
                          
                         
                        </div>
                  </div>
                  <div class="tab-pane fade" id="custom-tabs-one-profile" role="tabpanel" aria-labelledby="custom-tabs-one-profile-tab">
                  <div class="row">
                            <div class="col-6">
                               <label for="">DNI</label>

                               <input type="text" class="form-control" id="txt_dni" readonly style="background-color:white;">
                               
                            <!-- /btn-group -->
                    
                          
                            </div>
       
                            <div class="col-6 form-group">
                                <label for="" style="font-size:small;">NOMBRE</label>
                                <input type="text" class="form-control" id="txt_nom" readonly style="background-color:white;">
                            </div>
                            <div class="col-6 form-group">
                                <label for="" style="font-size:small;">APELLIDO PATERNO</label>
                                <input type="text" class="form-control" id="txt_apepat" readonly style="background-color:white;">
                            </div>
                            <div class="col-6 form-group">
                                <label for="" style="font-size:small;">APELLIDO MATERNO</label>
                                <input type="text" class="form-control" id="txt_apemat" readonly style="background-color:white;">
                            </div>
                            <div class="col-6 form-group">
                                <label for="" style="font-size:small;">CELULAR</label>
                                <input type="text" class="form-control" id="txt_celular" readonly style="background-color:white;">
                            </div>
                            <div class="col-6 form-group">
                                <label for="" style="font-size:small;">EMAIL</label>
                                <input type="text" class="form-control" id="txt_email" readonly style="background-color:white;">
                            </div>
                            <div class="col-12">
                                <label for="" style="font-size:small;">DIRECCIÓN</label>
                                <input type="text" class="form-control" id="txt_dire" readonly style="background-color:white;">
                            </div>     
                            <div class="col-12">
                                <label for="" style="font-size:small;">EN REPRESENTACIÓN</label>
                            </div>
                            <div class="col-12 row">
                                    <!-- radio -->
                                    <div class="col-4 form-group clearfix">
                                        <div class="icheck-success d-inline">
                                            <input type="radio" id="rad_presentacion1" name="r1" checked value="A Nombre Propio" disabled style="background-color:white;">
                                            <label for="rad_presentacion1" style="font-weight:normal;font-size:small">
                                                A Nombre Propio
                                            </label>
                                        </div>
                                    </div>        
                                    <div class="col-4 form-group clearfix">
                                        <div class="icheck-success d-inline">
                                            <input type="radio" id="rad_presentacion2" name="r1" value="A Otra Persona Natural" disabled style="background-color:white;">
                                            <label for="rad_presentacion2" style="font-weight:normal;font-size:small" disabled>
                                                A Otra Persona Natural
                                            </label>
                                        </div>
                                    </div> 
                                    <div class="col-4 form-group clearfix">
                                        <div class="icheck-success d-inline">
                                            <input type="radio" id="rad_presentacion3" name="r1" value="Persona Jurídica" disabled style="background-color:white;">
                                            <label for="rad_presentacion3" style="font-weight:normal;font-size:small" disabled>
                                            Persona Jurídica
                                            </label>
                                        </div>
                                    </div>                                                            
                            </div>     
                            <div class="col-12" id="div_juridico" style="display:none">
                                <div class="row">
                                    <div class="col-4 form-group">
                                        <label for="" style="font-size:small;">RUC</label>
                                        <input type="text" class="form-control" id="txt_ruc">
                                    </div>
                                    <div class="col-8 form-group">
                                        <label for="" style="font-size:small;" readonly>RAZON SOCIAL</label>
                                        <input type="text" class="form-control" id="txt_razon">
                                    </div>
                                </div>
                            </div>
                        </div>     
                  </div>
                
                </div>
              </div>
              <!-- /.card -->
            </div>
          </div>
      
        </div>
      </div>
      <div class="modal-footer">
       <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>  


<div class="modal fade" id="modal_derivar"  role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="lbl_titulo_derivar">
        </h5>
      </div>
      <div class="modal-body">
        <div class="row">
            <div class="col-6 form-group">
                <label for="">Fecha Registro:</label>
                <input type="text" id="txt_fecha_de" class="form-control" readonly style="background-color:white">
            </div>
            <div class="col-6">
                <label for="" style="font-size:small;">Acción:</label>
                <select class="js-example-basic-single" id="select_derivar_de" style="width:100%;">
                    <option value="DERIVAR">DERIVAR</option>
                    <option value="FINALIZAR">FINALIZAR</option>
                </select>
            </div>
              
            <div class="col-6 form-group div_derivacion">
                  <label for="">Área Origen:</label>
                  <input type="text" id="txt_origen_de" class="form-control" readonly style="background-color:white;width:100%">
            </div>
            <div class="col-6 form-group div_derivacion">
                <label for="">Área Destino:</label>
                <select class="js-example-basic-single" id="select_destino_de" style="width:100%;">
                    
                </select>
            </div>
            <div class="col-12 form-group">
                <label for="">Anexar documento</label>
                <input type="file" id="txt_documento_de" class="form-control">
            </div>
            <div class="col-12">
              <label for="">Descripción:</label>
              <textarea id="txt_descripcion_de" rows="3" class="form-control" style="resize:none;"></textarea>
            </div>
            <input type="text" name="" id="txt_idocumento_de" hidden>
            <input type="text" id="txt_idareorigen" hidden>
      
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-success" onclick="Registrar_Derivacion()">Registrar</button>
      </div>
    </div>
  </div>
</div>  
    <script>
      $(document).ready(function() {
        listar_tramite();
        Cargar_Select_Area();
        Cargar_Select_Tipo();
        $('.js-example-basic-single').select2();
      } );
      $("#select_derivar_de").change(function(){
        let de = document.getElementById('select_derivar_de').value;
        if(de=="DERIVAR"){
       
          let x = document.getElementsByClassName('div_derivacion');
          var i;
          for (i = 0; i < x.length; i++) {
            x[i].style.display= 'block';      
          }
        }else{
          let x = document.getElementsByClassName('div_derivacion');
          var i;
          for (i = 0; i < x.length; i++) {
            x[i].style.display= 'none';      
          }
        }
      });
    </script>